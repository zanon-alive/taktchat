# PR: feat(fase1): Dono da Plataforma e preparação para whitelabel (Fase 2)

**Branch:** `feature/fase1-dono-plataforma` → `main`

**Link para abrir o PR:** https://github.com/zanon-alive/taktchat/pull/new/feature/fase1-dono-plataforma

---

## Título do PR
```
feat(fase1): Dono da Plataforma e preparação para whitelabel (Fase 2)
```

## Corpo do PR (copie e cole)

---

## Objetivo
Consolidar o conceito de **Dono da Plataforma** (empresa de gestão, `super` apenas nela, planos da landing apenas da plataforma) e preparar estrutura de BD para **Fase 2 (whitelabel)**.

## Principais alterações

### Backend
- **Config:** `backend/src/config/platform.ts` com `getPlatformCompanyId()` e `isPlatformCompany()` (env `PLATFORM_COMPANY_ID`, default 1).
- **Migrations:** `type` e `parentCompanyId` em Companies; `companyId` e `targetType` em Plans.
- **Models e seeds:** Empresa 1 = `type=platform`; plano padrão com `companyId`/`targetType`; seed "Plano Whitelabel Básico".
- **FindAllPlanService:** Para landing (`listPublic === "false"`) filtra por `companyId = platformCompanyId` e `targetType = 'direct'`.
- **CreateUser/UpdateUser:** Apenas usuários da empresa de gestão podem ter `super = true`.
- **PlanController/CreatePlan/UpdatePlan:** Aceitam e persistem `targetType` e `companyId` (default plataforma e `direct`).
- **Testes:** FindAllPlanService.spec, CreateUserService.spec, UpdateUserService.spec (11 testes).

### Frontend
- **PlansManager:** Campo **Tipo** (Direto | Whitelabel) no formulário, coluna na tabela; payload com `targetType` e `companyId`.
- **Landing:** Filtro para não exibir planos whitelabel; nova seção **Revendedor** (gradiente + modal com formulário de lead).

### Documentação
- `.docs/visao-geral/whitelabel-architecture.md` com visão da Fase 2.
- README atualizado com referência à governança multi-empresa e ao doc de whitelabel.

## Como testar
1. Rodar migrations e seeds no backend.
2. Em Configurações > Planos: criar/editar plano e escolher Tipo Direto ou Whitelabel.
3. Acessar `/landing`: apenas planos diretos da plataforma; seção Revendedor após os planos.
4. Testes: `cd backend && NODE_ENV=test npx jest src/services/PlanService/__tests__/FindAllPlanService.spec.ts src/services/UserServices/__tests__/CreateUserService.spec.ts src/services/UserServices/__tests__/UpdateUserService.spec.ts`

## Próximo passo
Fase 2 (whitelabel) conforme `.docs/visao-geral/whitelabel-architecture.md`.
