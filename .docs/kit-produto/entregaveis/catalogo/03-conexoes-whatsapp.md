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

Detalhe comercial/técnico: [../extras/baileys-vs-oficial.md](../extras/baileys-vs-oficial.md).

## Nesta versão

Conexão **WhatsApp Cliente Demo Kit**, `channelType=baileys`, status `DISCONNECTED`. Serve para mostrar a tela, não para enviar.

Na Empresa 01 existe a conexão `teste` (QR / sem credencial salva nos logs do backend).

## Rodada futura

Escanear QR ou configurar Oficial e refazer prints de envio/recebimento.
