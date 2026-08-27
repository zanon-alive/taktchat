# Teste manual — modo móvel de conversas

Rode o frontend local (`cd frontend && npm start`) e o backend. Entre com um usuário que tenha `tickets.view`.

```bash
# Opcional: conferir que o SPA responde
BASE_URL="${BASE_URL:-http://localhost:3000}"
curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/tickets"
# Esperado: 200 (HTML do SPA; a tela em si exige login no browser)
```

## Checklist no navegador

### Celular (DevTools 390×844 ou aparelho real)

- [ ] Login cai em `/tickets`
- [ ] Não há menu hamburger / drawer do painel
- [ ] Lista de atendimentos e conversa abrem e enviam texto
- [ ] Sino de notificações permanece na barra
- [ ] Avatar: Perfil, Alternar tema, **Painel completo**, Sair
- [ ] **Painel completo** abre `/` com o menu lateral de volta
- [ ] Voltar para `/tickets` no mesmo viewport estreito: chrome compacto de novo

### Desktop (viewport ≥ md)

- [ ] `/tickets` continua com split (lista + chat) e drawer
- [ ] Hamburger e itens administrativos iguais ao antes

### PWA

- [ ] `manifest.json`: `start_url` e atalho são `/tickets` (não `/atendimento`)
- [ ] Android: “Adicionar à tela inicial” abre as conversas
- [ ] iOS Safari: Compartilhar → Adicionar à Tela de Início

## Fora desta entrega

Push com o app fechado, Capacitor/lojas e service worker não entram neste roteiro.
