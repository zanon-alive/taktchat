# Comercial — cliente final (padrão)

Formato: reunião 12–15 min. O player em `/apresentacoes/comercial-cliente-padrao` usa o mesmo texto.

Posicionamento: **CRM de conversa no WhatsApp** (contato → ticket). Não é CRM de pipeline/estoque.

## Slide 1 — Capa

**Para falar:** cada pessoa que fala vira contato; cada conversa em andamento vira ticket. Esta é a tela de login da demo comercial (só ambiente local).

- Player desta apresentação: `dono@taktchat.local` (empresa plataforma).
- Demo do ticket: `atendente@taktchat.local` — Beatriz, fila Suporte.
- Admin da empresa: `admin.cliente@taktchat.local`. Senha dos `@taktchat.local`: `LocalTest#2026`.
- Não usar estes logins em produção.

## Slide 2 — A dor

**Para falar:** atender no celular. A conversa some, não tem dono, a campanha sai do mesmo número e o gestor não vê métrica.

- Conversas espalhadas no aparelho da pessoa.
- Time sem fila: quem pegar, pegou.
- Disparo pelo celular arrisca o número da empresa.
- Sem volume, atraso nem dono do caso.

## Slide 3 — O que é

**Para falar:** não é “mais um WhatsApp Web”. É o CRM da conversa: a mensagem do contato vira ticket.

- Contato (quem) + ticket (a conversa em andamento).
- O cliente continua só no WhatsApp dele — sem protocolo na tela.
- Multi-empresa: cada tenant vê só os próprios dados.

## Slide 4 — Para quem

**Para falar:** empresa que já vive de WhatsApp e precisa de mais de uma pessoa no mesmo número.

- Atendimento e marketing no mesmo canal.
- Admin configura; supervisor olha o quadro; atendente fecha conversa.
- Não substitui HubSpot/Pipedrive de pipeline: é o CRM do canal WhatsApp.

## Slide 5 — O ticket (núcleo)

**Para falar:** cliente fala → fila → alguém aceita → trabalha até encerrar. A UI funciona sem WhatsApp; a mensagem no celular não sai.

- Pendente na fila → aceite (aberto).
- Responde, transfere, tagueia, encerra.
- Lista: Aguardando, Aceitos, Resolvidos.

## Slide 6 — Do contato ao ticket

**Para falar:** um contato que manda WhatsApp gera atendimento. Se já há conversa aberta naquela conexão, a mensagem continua nela. Se o atendimento anterior foi encerrado, nasce um novo.

- Entrada no número conectado (Baileys ou Oficial).
- Contato localizado ou criado pelo telefone.
- Ticket aberto do mesmo par contato+conexão: segue nele.
- Senão: pending na fila (ou bot / lgpd).
- Painel atualiza na hora; o cliente só vê o WhatsApp.

## Slide 7 — CRM de conversa

**Para falar:** ficha da pessoa, dono do caso, tags, histórico e fila. O que não faz: funil genérico, estoque, ERP. Pode conviver com um CRM de vendas.

- Contato = quem fala.
- Ticket = assunto em andamento.
- Histórico na empresa, não no celular do atendente.
- Um contato não tem dois tickets abertos na mesma conexão.

## Slide 8 — Trabalhar o ticket

**Para falar:** aceitar coloca dono. Responder, taguear e transferir organizam. Ao encerrar, o atendente registra o desfecho. Se o cliente falar de novo, começa um novo atendimento para o mesmo contato.

- Aguardando → aceitar → aberto.
- Histórico, texto, mídia, `/saudacao`.
- Tag, transferir fila ou colega.
- Encerrar com desfecho; nova mensagem gera novo atendimento.

## Slide 9 — Encerrar com desfecho

**Para falar:** Encerrar abre a escolha do resultado: uma coluna de fechamento, como Fechado ganho ou Fechado perdido, ou a saída do quadro. A empresa também pode configurar um desfecho padrão.

- A coluna escolhida permanece no Kanban mesmo com o atendimento encerrado.
- O desfecho preserva o resultado sem transformar o produto em CRM de oportunidades.
- Se o contato voltar a falar, o sistema gera um novo atendimento.

## Slide 10 — Funil no Kanban

**Para falar:** o Kanban organiza o andamento em **6 colunas** configuradas por tags `kanban=1`: Lead, Qualificado, Negociação, Aguardando cliente, Fechado ganho e Fechado perdido. O time arrasta durante a conversa e escolhe o desfecho ao encerrar. Não há pipeline de oportunidade com valor ou probabilidade.

- Lead — Carla (pendente). Qualificado — João (Vendas).
- Negociação — Maria (aberto, Urgente). Aguardando cliente — Ana (supervisor).
- Fechado ganho — Mercado Central. Fechado perdido — Pedro, mantido no quadro pelo desfecho.
- Mais de 8 colunas cansa; a demo usa 6.

## Slide 11 — Avanço automático das colunas

**Para falar:** horas paradas podem levar à próxima coluna (Lead 48h → Qualificado; Qualificado 72h → Negociação). Se o cliente responder com o atendimento aberto, ele pode voltar à coluna configurada. Depois de encerrado, uma nova mensagem gera outro atendimento em Lead. Fechado ganho/perdido não avançam sozinhos.

## Slide 12 — Dual channel

**Para falar:** Baileys (QR, começo barato) e API Oficial da Meta (volume e regras). Os dois no mesmo produto. Não vendemos “imune a ban”.

## Slide 13 — Automação

**Para falar:** fila e bot no primeiro atendimento; Flow Builder; campanha com cadência. IA só com plano e chave.

## Slide 14 — Visão da operação

**Para falar:** quem tem permissão vê volume. Atendente foca no chat. 403 na home da atendente é esperado.

## Slide 15 — Como começa

**Para falar:** trial, um número, uma fila, dois usuários. Campanha e flow vêm depois.

## Slide 16 — O que não prometemos

**Para falar:** é CRM de conversa no WhatsApp — não é CRM de pipeline, estoque ou ERP. Não é helpdesk com protocolo no celular do cliente. Baileys não é imune a ban. Oficial não libera disparo irrestrito.

## Slide 17 — Próximo passo

**Para falar:** demo completa: aceitar Carla em Lead, responder, avançar no Kanban, encerrar com desfecho e abrir o Funil. WhatsApp real só na conta deles.

- Entrar como `atendente@taktchat.local` / `LocalTest#2026`.
- Admin da demo: `admin.cliente@taktchat.local`.
- Ver o quadro em `/kanban` e quantidade/idade média em `/kanban/stats`.

## Slide 18 — CTA

**Para falar:** data do piloto, quem é o admin, qual número entra primeiro. Critério: pendente vira resposta humana em X minutos.
