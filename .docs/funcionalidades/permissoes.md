# Permissões e perfis

O modelo real é híbrido. Não existe uma camada central de `Roles` que determine todo o acesso.

## Ordem prática de decisão

1. `super = true` concede o escopo da plataforma.
2. `profile` distingue principalmente `admin` e `user`.
3. `permissions[]` concede permissões exatas, como `tickets.view`.
4. Wildcards, como `campaigns.*`, concedem ações do mesmo prefixo.
5. Na ausência de permissões granulares, há fallback para flags legadas.
6. O plano da empresa habilita ou desabilita famílias de recursos.
7. O tipo da empresa limita funções de plataforma, parceiro e cliente.

## Flags legadas relevantes

- `showDashboard`
- `allowRealTime`
- `allowConnections`
- `allTicket`

Elas ainda participam de menu e acesso. “Supervisor” não é um profile: é normalmente um `user` com permissões e flags ampliadas.

## Gates por plano

- `useCampaigns`
- `useKanban`
- `useOpenAi`
- `useIntegrations`
- `useSchedules`
- `useInternalChat`
- `useExternalApi`

Um gate de plano não substitui permissão, e esconder item no menu não substitui autorização no backend.

## Personas

| Persona | Representação real |
|---|---|
| Atendente | `profile = user`, filas e permissões operacionais |
| Supervisor operacional | `user` com `allTicket`, dashboard, tempo real e permissões adicionais |
| Admin da empresa | `profile = admin`, limitado à empresa e ao plano |
| Parceiro | usuário de empresa `whitelabel`, com escopo sobre empresas-filhas |
| Dono da plataforma | `super = true`, normalmente em empresa `platform` |

## Regras específicas confirmadas

- `/settings` bloqueia explicitamente `profile = user`.
- `/apresentacoes` exige empresa `platform`; `super`, admin da plataforma ou `apresentacoes.view`.
- Empresas e licenças aparecem para `super` ou empresa `whitelabel`.
- Relatório de cobrança do parceiro e todas as conexões são superfícies de `super`.
- Admin não recebe automaticamente recursos exclusivos de plataforma.

## Backend e APIs

As rotas usam três classes de autenticação: sessão/JWT, token/chave de empresa e rotas públicas específicas. A documentação de cada endpoint deve indicar sua classe.

## Pendências de segurança

- `ticketsUsers` e `ticketsDay` devem receber autenticação/autorização antes de serem tratados como dashboards seguros.
- Helmet está comentado e deve ser reativado/configurado.
- Componentes ou menus protegidos apenas no frontend não constituem controle de segurança.

## Referências

- [Mapa funcional do frontend](mapa-frontend.md)
- `.docs/legacy/PERMISSIONS-*.md` — histórico; não usar como fonte vigente quando divergir do código.

