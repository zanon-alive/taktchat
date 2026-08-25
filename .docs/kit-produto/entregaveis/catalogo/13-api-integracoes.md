# API e integrações

- API de mensagens `/messages-api` (token da empresa)
- Webhooks Meta `/webhooks/whatsapp`
- Widget e APIs públicas de site-chat
- Typebot / queue integration `/queue-integration`

## Autenticação

As APIs usam três camadas: sessão/JWT, token/chave de empresa e rotas públicas específicas. Confirmar a camada de cada endpoint; API existente não significa acesso público.

## Operação e limites

- Health check e Bull Board estão implementados; Bull/filas exigem Redis.
- Facebook/Instagram não são integrações maduras.
- Controllers `QueueAdvanced` sem rota ativa são órfãos.
- Helmet está comentado e é pendência de hardening.

Status: não exercitado com chamada externa. Documentação técnica antiga em `.docs/funcionalidades/` deve ser lida como histórica quando divergir deste catálogo.
