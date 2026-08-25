# Whitelabel, empresas e licenças

## Hierarquia

`platform` → `whitelabel` → `direct` (filha).

Nesta versão, **depois das migrations locais**:

| Empresa | type | parent |
|---------|------|--------|
| Empresa 01 | platform | — |
| Parceiro Demo Kit | whitelabel | — |
| Cliente Demo Kit | direct | Parceiro Demo Kit |

Licenças ativas até 2027 para parceiro e cliente (senão o login devolve `ERR_ACCESS_BLOCKED_PLATFORM`).

## Telas

`/companies`, `/licenses`, `/partner-billing-report` (super).

## Status

Tipos e licenças **criados no banco**. Menus de revenda na UI do parceiro: **a validar na rodada parceiro** (login da Ana funciona via API).
