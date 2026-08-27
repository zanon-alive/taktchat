# Teste manual — landing, tour e FAB WhatsApp

Rode da sua máquina local. Troque `BASE_URL` para produção se quiser repetir o checklist.

```bash
BASE_URL="${BASE_URL:-https://taktchat.com.br}"

echo "== SPA =="
for path in /landing /landing/v1 /tour /login /lgpd; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  if [ "$code" = "200" ]; then echo "✅ ${path} ${code}"; else echo "❌ ${path} ${code}"; fi
done

echo "== widget.js (CSS var e reduced-motion) =="
js=$(curl -s "${BASE_URL}/widget.js")
if echo "$js" | grep -q "taktchat-site-chat-bottom"; then
  echo "✅ widget.js usa --taktchat-site-chat-bottom"
else
  echo "❌ widget.js sem variável de empilhamento"
fi
if echo "$js" | grep -q "prefers-reduced-motion"; then
  echo "✅ widget.js respeita prefers-reduced-motion"
else
  echo "❌ widget.js sem prefers-reduced-motion"
fi

echo "== settings públicas (token wtV) =="
API="${API_URL:-https://api.taktchat.com.br}"
for key in enableSiteChatWidget supportWhatsAppNumber; do
  code=$(curl -s -o /tmp/taktchat-setting.json -w "%{http_code}" "${API}/public-settings/${key}?token=wtV")
  echo "${key}: HTTP ${code} $(head -c 80 /tmp/taktchat-setting.json)"
done

echo "== API health =="
code=$(curl -s -o /dev/null -w "%{http_code}" "https://api.taktchat.com.br/health")
if [ "$code" = "200" ]; then echo "✅ /health ${code}"; else echo "❌ /health ${code}"; fi
```

## Checklist no navegador

Não precisa enviar mensagem real no WhatsApp: conferir `href` (`wa.me` + texto de interesse) basta.

### Landing (`/landing`) — desktop (≥ 900px)

- [ ] Menu do topo legível (branco no header azul)
- [ ] Hero: **Falar no WhatsApp**, **Ver em 1 min**, **Começar agora**
- [ ] FAB verde, `position: fixed`, canto inferior direito
- [ ] Sem cookie: FAB ~16px acima do banner, sem sobreposição
- [ ] Com chat do site ligado: botão do site acima do FAB

### Landing — tablet/celular (abaixo de 900px)

- [ ] Hero **sem** o botão Falar no WhatsApp
- [ ] FAB continua visível

### Tour (`/tour`)

- [ ] **Voltar** e logo vão para `/landing`
- [ ] FAB ~88px do fundo
- [ ] Último slide: Falar no WhatsApp + Falar com especialista + Ir para a landing
- [ ] Esc volta para a landing

### Login (`/login`) — janela anônima

- [ ] Sem sessão: formulário de login visível
- [ ] API no ar: FAB visível, sem diálogo
- [ ] Aviso de API aberto (backend parado no local): FAB some no carregamento; ao fechar, volta

### Landing v1 (`/landing/v1`)

- [ ] Mesmo FAB compartilhado; empilha com cookies se o banner aparecer

## Produção 2026-08-27

- Landing, tour, tablet e cookies: **ok**
- Chat do site: botão não injetado (settings)
- Login frio: sessão Admin no browser de teste reconectou sozinha; o hide do FAB foi visto no flash do diálogo
