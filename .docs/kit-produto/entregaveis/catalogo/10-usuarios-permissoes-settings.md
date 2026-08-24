# Usuários, permissões e settings

## Usuários `/users`

`profile` na prática: `admin` ou `user`. Dono: `super=true` só na empresa plataforma. Flags: dashboard, tempo real, conexões, todos os tickets.

## Permissões

Lista granular no login (`tickets.view`, `campaigns.create`, …). Fallback se o array vier vazio.

## Settings `/settings`

Abas de operação: horário, canais, widget, LGPD, landing. Percorrer com admin — nesta versão não abriu cada aba (foco em login/ticket).

## Achado de UI

Atendente sem `dashboard.view` cai em **403** na home `/`. O caminho certo dela é `/tickets`.
