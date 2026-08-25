# Comercial — cliente final (padrão)

Formato: reunião 12–15 min. O player em `/apresentacoes/comercial-cliente-padrao` usa o mesmo texto.

Posicionamento: **CRM de conversa no WhatsApp** (contato → ticket). Não é CRM de pipeline/estoque.

## Slide 1 — Capa

**Para falar:** cada pessoa que fala vira contato; cada conversa em andamento vira ticket. O núcleo desta reunião é isso.

- Uma tela para atendimento, fila e histórico.
- Multi-empresa: cada cliente da operação isolado.
- Demo do ticket fica para o próximo passo.

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

**Para falar:** sim — um contato que manda WhatsApp gera ou reabre um ticket. O sistema acha o número; se já há conversa aberta naquela conexão, continua nela.

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

**Para falar:** aceitar coloca dono. Responder, taguear e transferir organizam. Encerrar fecha. Cliente fala de novo → reabre ou cria outro (tempo na conexão).

- Aguardando → aceitar → aberto.
- Histórico, texto, mídia, `/saudacao`.
- Tag, transferir fila ou colega.
- Encerrar; `timeCreateNewTicket` na volta.

## Slide 9 — Funil no Kanban

**Para falar:** não há pipeline de oportunidade. Tags Kanban viram colunas (Lead → Negociação → Fechado). Ticket novo entra na lane configurada em Tags Kanban. Encerrar aplica a lane de encerrar. Arrasta o ticket. Plano `useKanban`. Sem limite no código; 4–7 colunas leem melhor.

## Slide 10 — Avanço automático das colunas

**Para falar:** horas paradas podem ir para a próxima lane. Cliente respondendo no ticket **aberto** pode voltar ao rollback. Encerrar aplica a lane de encerrar; nova mensagem = ticket **novo**, já na lane de entrada (Lead, se configurado).

## Slide 11 — Dual channel

**Para falar:** Baileys (QR, começo barato) e API Oficial da Meta (volume e regras). Os dois no mesmo produto. Não vendemos “imune a ban”.

## Slide 12 — Automação

**Para falar:** fila e bot no primeiro atendimento; Flow Builder; campanha com cadência. IA só com plano e chave.

## Slide 13 — Visão da operação

**Para falar:** quem tem permissão vê volume. Atendente foca no chat. 403 na home da atendente é esperado.

## Slide 14 — Como começa

**Para falar:** trial, um número, uma fila, dois usuários. Campanha e flow vêm depois.

## Slide 15 — O que não prometemos

**Para falar:** é CRM de conversa no WhatsApp — não é CRM de pipeline, estoque ou ERP. Não é helpdesk com protocolo no celular do cliente. Baileys não é imune a ban. Oficial não libera disparo irrestrito.

## Slide 16 — Próximo passo

**Para falar:** demo no ticket (Maria aberta, Carla aguardando). WhatsApp real só na conta deles.

## Slide 17 — CTA

**Para falar:** data do piloto, quem é o admin, qual número entra primeiro. Critério: pendente vira resposta humana em X minutos.
