# Conexões WhatsApp

## Para que serve

Ligar o número (Baileys, QR) ou a conta Meta (API Oficial) por onde as mensagens entram e saem.

## Onde fica

`/connections` — admin. `/allConnections` — só dono (`super`).

## Dual channel

| Canal | Como liga | Quando indicar |
|-------|-----------|----------------|
| Baileys | QR no celular | Começo, volume baixo |
| API Oficial | Credenciais Meta / WABA | Operação profissional, templates |

Os dois canais coexistem por conexão. Labels sincronizadas do WhatsApp Web são uma integração separada das tags internas.

Detalhe comercial/técnico: [../extras/baileys-vs-oficial.md](../extras/baileys-vs-oficial.md).

## Nesta versão

Conexão **WhatsApp Cliente Demo Kit**, `channelType=baileys`, status **CONNECTED** (2026-08-23). Envio de teste e transferência persistida. Print: `pendente-whatsapp-connected.png`.

Na Empresa 01 existe a conexão `teste` (à parte do kit).

## Ainda aberto

Captura real da tela do celular (hoje ilustração de IA). API Oficial não configurada neste demo.

## Limites

- Baileys é não oficial: cadência e controles reduzem risco, mas não garantem anti-ban.
- API Oficial depende de credenciais, aprovação, templates e políticas da Meta.
- Facebook/Instagram têm código parcial e não são canais maduros para promessa comercial.
