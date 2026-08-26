# CDN e HTTP/3 — frontend público

**Não reduz o RTT da API** enquanto `api.taktchat.com.br` permanecer na Europa. Complementa o gzip da imagem Nginx.

## Gzip na origem (este repositório)

A imagem `taktchat-frontend` liga gzip em `frontend/nginx.conf`. Depois do deploy da imagem, conferir:

```bash
curl -sI -H 'Accept-Encoding: gzip' https://taktchat.com.br/static/js/vendor.*.js | grep -i content-encoding
```

Esperado: `content-encoding: gzip`.

## CDN na frente de `taktchat.com.br`

Pôr Cloudflare (ou equivalente) só no **frontend**:

- Cache de `/static/**` (JS/CSS/img) nos POPs do Brasil.
- **Não** cachear `api.taktchat.com.br`.
- **Não** cachear WebSocket (`/socket.io`).
- SSL full (strict) até o Traefik.

Isso acelera a **primeira carga** do painel. Tickets, login e socket continuam no RTT Europa.

Alteração de DNS/CDN **não** está neste repositório. Fazer no provedor DNS e, se preciso, nos labels Traefik.

## HTTP/3 no Traefik

O Traefik de produção vive na stack compartilhada (`stacks_producao-main-server`), não neste Git. HTTP/3 (QUIC) pode encurtar o handshake TLS; o ganho é menor que CDN + gzip.

Não aplicar YAML Traefik daqui. Tratar no repo das stacks, com rollback documentado.

## O que não fazer

- PM2 com checkout de código na VPS (ver `../infraestrutura/pm2-hibrido.md`).
- Cache de API no CDN.
- Esperar que gzip sozinho deixe a API em dezenas de ms no Brasil.
