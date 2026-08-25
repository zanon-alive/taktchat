# Roteiro de demo (10–15 min)

Ambiente: local, logins em `../../09-logins-locais.md`.

1. **Landing** (`/landing`) — dor, planos, revenda (1 min). Overlay de API só aparece se o health falhar de verdade.
2. **Login** — `atendente@taktchat.local` / `LocalTest#2026` (1 min).
3. **403 na home** — “atendente não usa dashboard” (20 s). Ir para Atendimento.
4. **Ticket Maria** — aberto, Negociação, tag Urgente (3 min). *Se a lista não carregar, mostrar no banco/admin.*
5. **Ticket João** — pendente em Qualificado: aceite (2 min). Carla está em Lead.
6. **Admin** — logout, `admin.cliente@taktchat.local`: filas, usuários, conexão CONNECTED, Tags Kanban e o quadro de **6 colunas** (3 min).
7. **Dono ou parceiro** — hierarquia empresas (2 min) *melhor na rodada parceiro*.
8. **Fecho** — próximo passo é WhatsApp real (QR).

**Encerrar:** mostre o diálogo em um ticket de teste. Não encerre a Maria (ela é a âncora da demo).

**Contatos vazios:** `atendente.vazio@taktchat.local` (mesma senha). Beatriz com `#Beatriz` vê Maria e Carla.

**Quadro:** botão de gráfico abre `/kanban/stats`. Tags Kanban explica que o alerta de 8 colunas não aparece neste demo (6 lanes).

Não prometer pipeline de oportunidade. Encerrar aplica a lane; o card `closed` permanece no quadro se tiver coluna Kanban.
