# Arquitetura Whitelabel - Fase 2

## Visão Geral

Este documento descreve a arquitetura do modo **whitelabel** do TaktChat. A Fase 1 preparou a estrutura de dados; a **Fase 2** implementa a lógica de negócio para hierarquia de empresas (plataforma → whitelabels → clientes), visibilidade por nível, licenças e fluxos de cadastro.

> **Referência técnica completa**: Consulte o plano de implementação em `.cursor/plans/plano_fase_1_-_dono_da_plataforma_(ajustado_para_hierarquia_whitelabel_futura)_11e7adc6.plan.md`, seção "Fase 2 - Whitelabel - Plano de Implementação Futura".

## Estrutura de Hierarquia de Empresas

O TaktChat suporta três níveis de empresas:

1. **Empresa Plataforma** (`type = 'platform'`)
   - Única empresa dona da plataforma
   - Única empresa com usuários `super = true`
   - Gerencia todas as outras empresas, planos e licenças

2. **Empresas Whitelabel** (`type = 'whitelabel'`)
   - Parceiros que revendem a plataforma
   - Têm empresas-filhas (`parentCompanyId = whitelabel.id`)
   - Podem criar planos próprios e gerenciar seus clientes

3. **Empresas Clientes Diretos** (`type = 'direct'`)
   - Clientes finais da plataforma ou de whitelabels
   - Se `parentCompanyId = null`: cliente direto da plataforma
   - Se `parentCompanyId = whitelabel.id`: cliente de um whitelabel

## Modelo de Licenças e Cobrança

### Cobrança por Planos

O Dono da Plataforma cobra whitelabels baseado na **quantidade de planos ativos** que o whitelabel distribui para seus clientes finais.

**Exemplo**:
- Whitelabel tem 10 empresas-filhas
- Cada empresa-filha tem 1 plano ativo
- Whitelabel paga por 10 planos (mesmo que sejam planos diferentes)

### Estrutura de Planos

- **Planos Diretos** (`targetType = 'direct'`):
  - Criados pela plataforma (`companyId = platformCompanyId`)
  - Aparecem na landing pública
  - Para clientes finais

- **Planos Whitelabel** (`targetType = 'whitelabel'`):
  - Criados pela plataforma (`companyId = platformCompanyId`)
  - Valores e limites diferenciados para revenda
  - Whitelabel pode criar planos próprios (`companyId = whitelabel.id`)

## Permissões e Perfis

### Dono da Plataforma (`super = true`)

- Vê e gerencia **todas** as empresas, planos e licenças
- Único que pode criar empresas `type = 'whitelabel'`
- Acessa relatórios consolidados globais

### Admin de Whitelabel (`profile = 'admin'`, `super = false`)

**Pode**:
- Gerenciar apenas empresas-filhas (`parentCompanyId = whitelabel.id`)
- Criar/editar planos próprios
- Associar planos a empresas-filhas
- Ver relatórios consolidados de suas empresas-filhas

**Não pode**:
- Acessar outras empresas (diretas da plataforma ou de outros whitelabels)
- Criar usuários `super`
- Ver relatórios globais da plataforma

### Admin de Cliente Direto (`profile = 'admin'`, `super = false`)

**Pode**:
- Gerenciar apenas a própria empresa
- Ver licenças/assinaturas da própria empresa
- Renovar licenças

**Não pode**:
- Criar empresas-filhas
- Criar planos
- Ver outras empresas

## Fluxos Principais

### Cadastro de Whitelabel

1. Dono da Plataforma cria empresa `type = 'whitelabel'`
2. Cria usuário admin para o whitelabel (`profile = 'admin'`, `super = false`)
3. Associa planos whitelabel disponíveis
4. Define configurações de revenda (markup, limites, etc.)

### Cadastro de Cliente pelo Whitelabel

1. Admin do whitelabel cria empresa `type = 'direct'`, `parentCompanyId = whitelabel.id`
2. Cria usuário admin para o cliente (`profile = 'admin'`, `super = false`)
3. Associa plano ao cliente (próprio do whitelabel ou revendido da plataforma)
4. Cria licença/assinatura para o cliente

### Cadastro de Cliente Direto pela Plataforma

1. Dono da Plataforma cria empresa `type = 'direct'`, `parentCompanyId = null`
2. Cria usuário admin para o cliente
3. Associa plano `targetType = 'direct'` da plataforma
4. Cria licença/assinatura

### Cadastro direto na landing page

1. Dono da Plataforma habilita `enableLandingSignup` em Configurações > Options
2. Visitante acessa `/landing`, preenche formulário de cadastro (seção #cadastro)
3. Sistema cria empresa `type = 'direct'`, usuário admin e licença trial (14 dias) via `DirectSignupService`
4. Endpoints públicos: GET `/public/direct-signup/config`, POST `/public/direct-signup` (com rate limit)

### Cadastro por link do parceiro (signup parceiro)

1. Parceiro whitelabel compartilha link com token (ou `?partner=id`) para a página `/signup-partner`
2. Visitante preenche dados; sistema valida parceiro e plano, cria empresa `type = 'direct'` com `parentCompanyId = whitelabel.id` e licença trial (dias configuráveis em `trialDaysForChildCompanies`)
3. Endpoints: GET `/public/partner-signup/config`, POST `/public/partner-signup`

### Relatório de cobrança e snapshots (Dono da Plataforma)

1. Super acessa **Relatório de cobrança** (`/partner-billing-report`) no menu
2. Visualiza resumo por parceiro (empresas-filhas, licenças ativas, valor devido) e lista detalhada de licenças
3. Pode **registrar cobrança do período** (botão) – gera um snapshot por parceiro (`PartnerBillingSnapshot`) com período, totais e data do registro
4. Tabela "Cobranças registradas" lista snapshots; filtros opcionais por parceiro e período
5. Configuração **licenseWarningDays** em Options define quantos dias antes do vencimento disparar avisos (cron `licenseBillingWarningCron`)

### Bloqueio por cobrança e controle de acesso

1. **Plataforma bloqueia parceiro**: Dono da Plataforma suspende a licença do whitelabel (página Licenças → suspender). Com isso, o parceiro e **todas as empresas-filhas** perdem acesso (verificação em login e refresh via `CompanyAccessService`).
2. **Parceiro bloqueia empresa cliente**: Admin whitelabel na página Empresas pode bloquear/liberar acesso de cada empresa-filha (coluna ACESSO). Persiste em `Company.accessBlockedByParent`; endpoint PATCH `/companies/:id/block-access`.
3. **Mensagens ao usuário**: Login e refresh retornam 403 com códigos específicos (ex.: `ERR_ACCESS_BLOCKED_PLATFORM`, `ERR_ACCESS_BLOCKED_PARTNER`, `ERR_LICENSE_OVERDUE`); frontend exibe mensagem adequada e redireciona para login.

## Validações e Regras de Negócio

- Não permitir loops em `parentCompanyId`
- Empresa `type = 'platform'` sempre tem `parentCompanyId = null`
- Empresa `type = 'whitelabel'` sempre tem `parentCompanyId = null`
- Whitelabel só pode gerenciar empresas-filhas
- Cliente direto só pode gerenciar própria empresa
- Apenas `super` pode criar empresas `type = 'whitelabel'`

## Status de Implementação

- ✅ **Fase 1 (Concluída)**: Estrutura de dados preparada
  - `Company.type` (obrigatório)
  - `Company.parentCompanyId` (nullable, FK)
  - `Plan.companyId` (FK para empresa dona)
  - `Plan.targetType` ('direct' | 'whitelabel')
  - Configuração `PLATFORM_COMPANY_ID`
  - Validação de `super` apenas na empresa plataforma

- ✅ **Fase 2 (Concluída)**: Modo whitelabel implementado
  - Etapa 1: Hierarquia e criação de empresas whitelabel (CreateCompanyService, listagens e UpdateCompanyService com filtro por nível; UI Empresas com tipo e empresa pai).
  - Etapa 2: Visibilidade de planos por nível (ListPlansService, FindAllPlanService, CreatePlanService).
  - Etapa 3: Modelo License (CRUD) e rotas `/licenses`.
  - Etapa 4: Dashboard por nível (GET `/dashboard/summary`).
  - Etapa 5: Menus e fluxos (Empresas/Licenças para super e whitelabel; página Licenças; company.type no refresh).
  - Etapa 6: Relatório de cobrança por parceiro (página `/partner-billing-report`, GET `/dashboard/partner-billing-report`, `licenseWarningDays` em Options).
  - Etapa 7: Cadastro direto na landing (`enableLandingSignup`, DirectSignupService, SignupForm em `/landing`; endpoints `/public/direct-signup/*`).
  - Etapa 8: Cobrança persistida (modelo `PartnerBillingSnapshot`, migration, CalculateAndStorePartnerBillingService; GET `/dashboard/partner-billing-snapshots`, POST `/dashboard/partner-billing-report/calculate`; UI de cobranças registradas).
  - Bloqueio por cobrança: CompanyAccessService, BlockCompanyAccessService, PATCH `/companies/:id/block-access`; suspensão de licença; mensagens no login/refresh (ERR_ACCESS_BLOCKED_*). Cadastro por parceiro: `/signup-partner`, PartnerSignupService, `trialDaysForChildCompanies`.
  - Detalhes: `.docs/branchs/feature/fase2-whitelabel/analise-fase2-whitelabel.md` e `analise-bloqueio-cobranca-whitelabel.md`

## Referências

- Plano completo de implementação: `.cursor/plans/plano_fase_1_-_dono_da_plataforma_(ajustado_para_hierarquia_whitelabel_futura)_11e7adc6.plan.md`
- Roadmap geral: `.docs/visao-geral/roadmap.md`
