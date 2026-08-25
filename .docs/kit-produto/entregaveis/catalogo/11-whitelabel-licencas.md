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

## Capacidades

- Hierarquia e bloqueio de empresas-filhas.
- Licenças, avisos, crons e snapshots de cobrança.
- Registro de pagamento (`register-payment`).
- Mercado Pago funcional quando configurado.
- Gateway genérico **manual/stub**: não prometer cobrança automática para provedores genéricos.

## Status

Tipos e licenças **criados no banco**. Menus de revenda foram validados no ambiente local; esta documentação não afirma implantação em produção.
