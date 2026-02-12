# Arquitetura Whitelabel - Fase 2

## Visão Geral

Este documento descreve a arquitetura planejada para a **Fase 2** do TaktChat, que implementará suporte completo para comercialização whitelabel. A Fase 1 preparou a estrutura de dados necessária, e a Fase 2 implementará toda a lógica de negócio para suportar múltiplos níveis de empresas.

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

- ⏳ **Fase 2 (Planejada)**: Implementação completa do modo whitelabel
  - Controllers e serviços ajustados para hierarquia
  - Modelo de licenças/assinaturas
  - Relatórios e dashboards por nível
  - Fluxos de cadastro e onboarding
  - Validações completas

## Referências

- Plano completo de implementação: `.cursor/plans/plano_fase_1_-_dono_da_plataforma_(ajustado_para_hierarquia_whitelabel_futura)_11e7adc6.plan.md`
- Roadmap geral: `.docs/visao-geral/roadmap.md`
