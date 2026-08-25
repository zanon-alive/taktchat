function shot(file, caption) {
  return {
    image: file,
    imageCaption: caption || "",
    placeholder: null,
  };
}

function pendente(file, oQueGravar) {
  return {
    image: file,
    imageCaption: file,
    placeholder: oQueGravar,
  };
}

const comercialClientePadrao = [
  {
    title: "Taktchat",
    kicker: "Comercial · cliente final · padrão",
    lead:
      "Plataforma para o time atender no WhatsApp como operação, não como conversa no celular. Cada pessoa que fala vira contato; cada conversa em andamento vira ticket. Nesta reunião o núcleo é isso.",
    bullets: [
      "Uma tela para atendimento, fila e histórico.",
      "Multi-empresa: cada cliente da operação isolado.",
      "Reunião de 10–12 minutos; demo do ticket depois.",
    ],
    ...shot("f1-login.png", "Tela de login do produto"),
  },
  {
    title: "A dor",
    lead:
      "O padrão hoje é atender no WhatsApp do celular. A conversa some, não tem dono, não tem fila e a campanha sai do mesmo número que o atendimento — isso queima o chip e não gera métrica.",
    bullets: [
      "Conversas espalhadas no aparelho da pessoa.",
      "Time sem fila: quem pegar, pegou.",
      "Disparo pelo celular arrisca o número da empresa.",
      "Gestor não vê volume, atraso nem quem fechou o caso.",
    ],
    ...shot(
      "pendente-whatsapp-celular.png",
      "Ilustração (IA): o “antes” — conversas pessoais misturadas com clientes. Não é print do aparelho real."
    ),
  },
  {
    title: "O que é",
    lead:
      "Taktchat não é “mais um WhatsApp Web”. É o CRM da conversa: a mensagem do contato vira ticket, com responsável, fila e histórico que o próximo atendente encontra.",
    bullets: [
      "Contato (quem) + ticket (a conversa em andamento).",
      "O cliente continua só no WhatsApp dele — sem protocolo na tela.",
      "Multi-empresa: cada tenant vê só os próprios dados.",
    ],
    ...shot("f3-atendente-chat-maria.png", "Chat da Maria: ticket com histórico"),
  },
  {
    title: "Para quem",
    lead:
      "Cabe em empresa que já vive de WhatsApp — suporte, vendas, financeiro — e precisa de mais de uma pessoa no mesmo número, com papéis diferentes.",
    bullets: [
      "Atendimento e marketing que compartilham o canal.",
      "Admin configura; supervisor olha o quadro; atendente fecha conversa.",
      "Não substitui HubSpot/Pipedrive de pipeline: é o CRM do canal WhatsApp.",
    ],
    ...shot("f18-admin-usuarios.png", "Usuários da empresa: atendente, admin, supervisor"),
  },
  {
    title: "O ticket (núcleo)",
    lead:
      "Fluxo que o cliente novo precisa ver: a mensagem entra, cai na fila, alguém aceita e trabalha até encerrar. Transferir e taguear existem; encerrar de verdade precisa do WhatsApp conectado.",
    bullets: [
      "Cliente fala → pendente na fila → atendente aceita (aberto).",
      "Responde, transfere, aplica tag, encerra.",
      "Lista separa Aguardando, Aceitos e Resolvidos.",
      "Sem conexão WhatsApp a UI funciona; a mensagem no celular não sai.",
    ],
    ...shot("f2-atendente-tickets-lista.png", "Lista: Maria (aberto) e Carla (aguardando)"),
  },
  {
    title: "Do contato ao ticket",
    lead:
      "Sim: um contato que manda WhatsApp gera (ou reabre) um ticket. O backend acha o número na agenda da empresa; se já há conversa aberta naquela conexão, continua nela. Se não há, nasce um ticket novo — em geral pendente na fila.",
    bullets: [
      "Entrada: mensagem no número conectado (Baileys ou API Oficial).",
      "Contato localizado ou criado pelo telefone.",
      "Ticket aberto do mesmo contato + conexão: a conversa segue nele.",
      "Senão: pending na fila (ou bot / lgpd, se estiver ligado).",
      "O painel atualiza na hora (Socket.IO) — o cliente só vê o WhatsApp.",
    ],
    ...shot("f6-atendente-aceite-carla.png", "Pendente vira aberto quando o atendente aceita"),
  },
  {
    title: "CRM de conversa",
    lead:
      "Para time de atendimento e vendas no WhatsApp, isso funciona como CRM operacional: ficha da pessoa, dono do caso, tags, histórico e fila. O que não faz: funil genérico, estoque, billing de ERP. Muita empresa usa os dois — Pipedrive para pipeline, Taktchat para o WhatsApp.",
    bullets: [
      "Contato = quem fala (nome, número, tags).",
      "Ticket = assunto em andamento (status, fila, responsável).",
      "Histórico fica na empresa, não no aparelho do atendente.",
      "Um contato não tem dois tickets abertos na mesma conexão.",
    ],
    ...shot("f21-admin-contatos.png", "Agenda da empresa: o contato que origina o ticket"),
  },
  {
    title: "Trabalhar o ticket",
    lead:
      "O dia a dia cabe numa receita. Aceitar tira da fila e coloca dono. Responder, taguear e transferir organizam o caso. Encerrar fecha. Se o cliente falar de novo, o sistema reabre ou cria outro conforme o tempo configurado na conexão.",
    bullets: [
      "Aguardando → aceitar → aberto com o seu usuário.",
      "Ler histórico, responder (texto, mídia, /saudacao).",
      "Tag (Urgente, VIP), transferir fila ou colega.",
      "Encerrar; volta a falar → reabre ou ticket novo (timeCreateNewTicket).",
    ],
    ...shot("f3-atendente-chat-maria.png", "Chat com histórico: a ficha que o time vê"),
  },
  {
    title: "Funil no Kanban",
    lead:
      "Não há pipeline de oportunidade (valor, probabilidade, ganho/perdido). Dá para simular um funil visual: tags marcadas como Kanban viram colunas (Lead → Negociação → Fechado). O time arrasta o ticket. Depende do plano (useKanban).",
    bullets: [
      "Coluna = tag com flag Kanban, não fase nativa de CRM.",
      "Sem limite no código: cabem quantas colunas o admin criar.",
      "Na prática, 4–7 fases leem melhor no quadro.",
      "Rotas: /kanban e /TagsKanban (esta rodada do kit não fotografou a tela).",
    ],
    ...pendente(
      "pendente-kanban.png",
      "Grave /kanban (ou /TagsKanban) com 4 colunas tipo Lead / Qualificado / Negociação / Fechado e um card arrastável."
    ),
  },
  {
    title: "Avanço automático das colunas",
    lead:
      "Há automação de lane, mas não “ao encerrar, volta para Lead”. Tempo parado numa coluna pode mandar para a próxima. Cliente falando de novo, no ticket ainda aberto, pode voltar à coluna de rollback. Ticket novo depois de encerrado nasce sem coluna de funil — alguém (ou uma regra) precisa colocar em Lead.",
    bullets: [
      "timeLane + nextLane: horas sem interação no ticket aberto → próxima coluna (e pode mandar mensagem).",
      "rollbackLane: cliente responde de novo no ticket aberto → volta à coluna configurada.",
      "Regras de tag: classificam contato por campo (região, segmento…) no cron — não pelo status closed.",
      "Conversa encerrada + nova mensagem = ticket novo, em geral sem tag Kanban Lead.",
    ],
    ...pendente(
      "pendente-kanban-lane.png",
      "Grave o modal da tag Kanban mostrando Tempo (horas), Lane seguinte e Voltar para Lane após retomar."
    ),
  },
  {
    title: "Dual channel",
    lead:
      "O mesmo produto fala com o WhatsApp de dois jeitos. Baileys (QR no celular) para começar barato. API Oficial da Meta para operação com volume e regras da plataforma.",
    bullets: [
      "Baileys: lê o QR, sessão no servidor — risco de conta pessoal existe.",
      "Oficial: WABA / Cloud API — template e janela de 24h valem.",
      "Dá para ter os dois tipos de conexão na mesma empresa.",
      "Não vendemos “imune a ban”: cadência e política da Meta continuam.",
    ],
    ...shot("f17-admin-qrcode-modal.png", "QR Baileys para conectar o número"),
  },
  {
    title: "Automação",
    lead:
      "Fila e bot resolvem o primeiro atendimento. Flow Builder desenha o caminho. Campanha dispara lista com intervalo. IA só entra se houver plano e chave — não vem “ligada” em todo cliente.",
    bullets: [
      "Filas com horário, integração e mensagem de saudação.",
      "Flow Builder visual (nós e conexões) quando o plano libera.",
      "Campanhas: lista, cadência, validação de número.",
      "IA / RAG: opcional, sobre arquivos da empresa.",
    ],
    ...pendente(
      "pendente-flow-builder.png",
      "Grave /flowbuilders: canvas do Flow Builder com um fluxo visível (nós e conexões)."
    ),
  },
  {
    title: "Visão da operação",
    lead:
      "Quem tem permissão vê volume e atraso. Quem atende não precisa (e muitas vezes não pode) abrir o dashboard: o 403 da atendente na home é esperado, não um bug.",
    bullets: [
      "Dashboard e relatórios para admin e supervisor.",
      "Tempo real (/moments) para quem acompanha a fila ao vivo.",
      "Atendente: foco em Atendimento (tickets).",
    ],
    ...shot("f14-admin-dashboard.png", "Dashboard do admin (KPIs)"),
  },
  {
    title: "Como começa",
    lead:
      "O caminho curto: trial na landing, admin conecta um número, cria uma fila de suporte e dois usuários. No dia seguinte o time já trabalha ticket — campanha e flow vêm depois.",
    bullets: [
      "Landing / trial ou cadastro combinado com o comercial.",
      "Admin: conexão WhatsApp + filas + usuários.",
      "Atendente entra só em Atendimento e pega a fila dele.",
    ],
    ...shot("f19-admin-filas.png", "Filas: Suporte, Vendas, Financeiro"),
  },
  {
    title: "O que não prometemos",
    lead:
      "Melhor perder a venda agora do que estourar expectativa no go-live. Quatro limites que o produto não esconde.",
    bullets: [
      "É CRM de conversa no WhatsApp — não é CRM de pipeline, estoque ou ERP.",
      "Não é helpdesk com protocolo visível para o cliente no celular.",
      "Baileys usa conta WhatsApp comum: banimento é risco real.",
      "API Oficial não libera disparo irrestrito (template + 24h).",
    ],
    ...shot("f15-admin-conexoes-disconnected.png", "Conexão desconectada — o número precisa estar no ar"),
  },
  {
    title: "Próximo passo",
    lead:
      "A demo de 15 minutos é o ticket: Maria (já aberta) e Carla (aguardando aceite). Só depois conectamos o WhatsApp real da empresa — QR na conta deles, não na nossa demo eterna.",
    bullets: [
      "Demo: aceitar pendente, responder, ver tag e transferir.",
      "Piloto: um número + uma fila de suporte.",
      "WhatsApp real só na conta e no celular de vocês.",
    ],
    ...shot("f5-atendente-aguardando.png", "Aba Aguardando: ticket pronto para aceitar"),
  },
  {
    title: "CTA",
    lead:
      "Fechamento desta reunião: data do piloto, quem é o admin, qual número entra primeiro. Sem isso vira “vamos ver” e o chip continua no bolso.",
    bullets: [
      "Agendar piloto: 1 conexão + 1 fila + 2 atendentes.",
      "Critério de sucesso: pendente vira resposta humana em X minutos.",
      "Valores: tabela da landing; proposta comercial à parte.",
    ],
    ...pendente(
      "pendente-landing-hero.png",
      "Grave /landing: hero da página pública + formulário de lead visível."
    ),
  },
];

const comercialClienteLonga = [
  ...comercialClientePadrao,
  {
    title: "Jornada do ticket com números",
    kicker: "Extensão da versão longa",
    lead:
      "Três estados que o gestor precisa decorar. Pendente = ninguém pegou. Aberto = tem dono. Encerrado = acabou. No seed: Maria aberta (Urgente), João pendente em Vendas, Pedro já fechado.",
    bullets: [
      "Pendente / aberto / encerrado (há também bot, lgpd, nps, grupo).",
      "A fila define quem vê o ticket: atendente da Suporte não vê Vendas.",
      "Admin com “ver todos” enxerga o quadro inteiro da empresa.",
    ],
    ...shot("f13-admin-tickets.png", "Visão do admin: tickets e filas"),
  },
  {
    title: "Quando o cliente volta a falar",
    lead:
      "Ticket encerrado não volta sozinho para o mesmo card. Nova mensagem no mesmo número cria outro ticket (FindOrCreate não reusa closed). O contato continua o mesmo; a coluna Kanban Lead não é herdada.",
    bullets: [
      "Aberto / pendente / bot: a mensagem entra no mesmo ticket.",
      "Encerrado: o FindOrCreate não reusa closed — nasce outro ticket.",
      "Esse ticket novo não herda a coluna Kanban (Lead) sozinho.",
      "LGPD ligado: pode nascer em lgpd até o consentimento.",
      "Grupo WhatsApp: status group, se a empresa permitir.",
    ],
    ...shot("f2-atendente-tickets-lista.png", "A lista é o quadro vivo dos casos, não um protocolo"),
  },
  {
    title: "A equipe fala primeiro",
    lead:
      "O ticket também nasce de dentro: Contatos → iniciar conversa. Costuma já nascer aberto e atribuído a quem criou. A regra é a mesma: um ticket aberto por contato naquela conexão — senão o time duplica caso.",
    bullets: [
      "Saída: a empresa chama o contato (conexão padrão ou escolhida).",
      "Impede dois abertos do mesmo número na mesma conexão.",
      "Atendente do seed pode não ter tickets.create — admin inicia se faltar a flag.",
      "Sem WhatsApp CONNECTED a UI tenta; a mensagem no celular não sai.",
    ],
    ...shot("f7-atendente-modal-transferir.png", "Transferir: o caso muda de dono ou de fila, o contato permanece"),
  },
  {
    title: "Papéis na empresa",
    lead:
      "O código não tem um cargo mágico “financeiro”. Há admin, user (atendente) com flags, supervisor via permissão, e super só na plataforma. Vender um organograma que o sistema não tem gera treino errado.",
    bullets: [
      "Admin: conexões, filas, usuários, settings.",
      "Supervisor: quadro e dashboard; não precisa configurar o número.",
      "Atendente: tickets da(s) fila(s) dele — home `/` pode dar 403.",
    ],
    ...shot("f26-supervisor-dashboard.png", "Dashboard do supervisor"),
  },
  {
    title: "Campanhas com responsabilidade",
    lead:
      "Campanha não é “colar a lista no WhatsApp Web”. É lista, intervalo entre envios e validação de número. No canal oficial ainda entram template aprovado e a janela de 24 horas.",
    bullets: [
      "Listas de contatos + cadência (não disparar em rajada).",
      "Validação reduz número inexistente / mal formatado.",
      "Oficial: fora da janela, só template. Baileys: risco de ban sobe com volume.",
    ],
    ...pendente(
      "pendente-campanhas.png",
      "Grave /campaigns: lista de campanhas (nome, status, cadência). Se o menu não aparecer, ligue campanhas no localStorage cshow."
    ),
  },
  {
    title: "IA com pé no chão",
    lead:
      "IA no Taktchat é peça opcional: precisa de plano, chave do provedor e, se for RAG, arquivos da empresa. Não substitui o humano quando o caso é exceção, reclamação ou venda consultiva.",
    bullets: [
      "Desligada por padrão em tenant sem chave.",
      "RAG lê documentos que a empresa enviou — não a internet inteira.",
      "Pergunta honesta: quem responde quando a IA errar?",
    ],
    ...pendente(
      "pendente-ia-prompts.png",
      "Grave /prompts ou /ai-settings: tela de prompt/IA com aviso de chave, sem secrets visíveis."
    ),
  },
  {
    title: "Entradas além do WhatsApp",
    lead:
      "Lead da landing, formulário de revenda e widget no site podem abrir ticket com origem marcada (EntrySource). O time trata igual: é conversa na fila, só que o canal de entrada não foi o WhatsApp.",
    bullets: [
      "Landing: lead e “quero ser revendedor”.",
      "Widget do site (widget.js) quando a empresa ativa nas settings.",
      "A origem fica no ticket para relatório e fila certa.",
    ],
    ...pendente(
      "pendente-widget-chat-site.png",
      "Grave /landing com o widget de chat do site aberto (bolha + janela), ou a tela de ajuda EntrySource."
    ),
  },
  {
    title: "LGPD",
    lead:
      "Consentimento, ocultar número e mensagens ligam nas configurações da empresa — não são “automáticos para todo mundo”. Vale alinhar com o DPO do cliente o que será gravado.",
    bullets: [
      "Flags nas settings (consentimento, mascarar contato, etc.).",
      "Mídia fica no volume da empresa, não misturada com outro tenant.",
      "Não prometemos consultoria jurídica: o produto oferece os controles.",
    ],
    ...shot("f20-admin-settings.png", "Configurações > Opções (base; gravar recorte LGPD se a aba existir)"),
  },
  {
    title: "Planos (referência da landing)",
    lead:
      "Básico, Premium e Enterprise na página pública são âncora de conversa, não a proposta assinada. Desconto, usuários inclusos e canal oficial fecham em tabela comercial à parte.",
    bullets: [
      "Valores da /landing#plans como referência.",
      "Campanhas, flow e IA costumam depender do plano / flag.",
      "Proposta: papel, não print da landing.",
    ],
    ...pendente(
      "pendente-landing-planos.png",
      "Grave /landing#plans: os três cards de plano com preços visíveis."
    ),
  },
  {
    title: "Encerramento",
    lead:
      "Piloto pequeno e mensurável. Se em duas semanas o pendente não vira resposta humana, o problema não era o print bonito — era fila, horário ou número desconectado.",
    bullets: [
      "Escopo: 1 conexão + 1 fila + 2 atendentes.",
      "Critério: tempo máximo do pendente até a primeira resposta.",
      "Só então falar de campanha e segundo número.",
    ],
    ...shot("f6-atendente-aceite-carla.png", "Aceite: Carla atribuída à atendente"),
  },
];

const comercialParceiroPadrao = [
  {
    title: "Taktchat para parceiros",
    kicker: "Comercial · revenda · padrão",
    lead:
      "Vocês revendem o mesmo produto com a operação no modelo whitelabel: seus clientes entram como empresas filhas. A marca e o comercial são de vocês; a plataforma é nossa.",
    bullets: [
      "Revenda com a sua marca na operação (whitelabel).",
      "Você não reconstrói omnichannel: usa o que já existe.",
      "Reunião de 10–12 minutos focada no modelo, não no chat.",
    ],
    ...shot("f23-parceiro-empresas-filhas.png", "Parceiro: empresas filhas (Cliente Demo Kit)"),
  },
  {
    title: "Por que revender",
    lead:
      "O cliente do parceiro já pediu “WhatsApp profissional”. Construir isso (sessão, fila, campanha, Meta) é outro produto. Revenda encaixa o Taktchat no portfólio sem virar factory de software.",
    bullets: [
      "Demanda já existe no mercado de vocês.",
      "Custo de construir omnichannel: anos, não um projeto.",
      "Vocês vendem e suportam o cliente; nós operamos a plataforma.",
    ],
    ...shot("f3-atendente-chat-maria.png", "O produto que o cliente final usa: o ticket"),
  },
  {
    title: "O modelo",
    lead:
      "Três tipos de empresa no banco: platform (nós), whitelabel (vocês), direct (o cliente final, filho de vocês). A cobrança da plataforma chega no parceiro; o parceiro cobra a filha como quiser.",
    bullets: [
      "Você = empresa whitelabel.",
      "Seus clientes = empresas direct filhas.",
      "Plataforma cobra você; você cobra eles.",
      "Usuário super não é do parceiro — é do dono da instância.",
    ],
    ...shot("f23-parceiro-empresas-filhas.png", "Hierarquia visível: filha sob o parceiro"),
  },
  {
    title: "O que você vende",
    lead:
      "O catálogo é o mesmo do cliente final: o WhatsApp vira ticket, com filas, dual channel e campanhas. O parceiro não precisa (e não deve) operar o chat do cliente — senão vira BPO, não revenda.",
    bullets: [
      "O que a filha compra: CRM de conversa no WhatsApp (contato → ticket).",
      "Painel do parceiro: empresas e licenças, não a fila do cliente.",
      "Suporte de segundo nível: vocês; incidente de infra: plataforma.",
    ],
    ...shot("f22-parceiro-tickets-menu.png", "Painel do parceiro (não é o chat do cliente)"),
  },
  {
    title: "O argumento do ticket",
    lead:
      "Na reunião com a filha, o gancho é o mesmo do comercial de cliente: WhatsApp no celular não é CRM. Cada contato que fala gera ticket, com fila e dono. Vocês vendem isso — não um funil de oportunidades genérico.",
    bullets: [
      "Contato fala no número da filha → ticket na fila dela.",
      "Time da filha aceita, responde, transfere, encerra.",
      "Histórico fica na empresa-filha, isolado das irmãs.",
      "Honestidade: não é Pipedrive; é o CRM da conversa no WhatsApp.",
    ],
    ...shot("f3-atendente-chat-maria.png", "O que a filha opera no dia a dia"),
  },
  {
    title: "Cadastro",
    lead:
      "Três portas. A filha pode nascer da landing da plataforma, do formulário /signup-partner, ou você cria a empresa no painel. O importante é ela nascer já como filha, com licença.",
    bullets: [
      "Landing pública da plataforma.",
      "Cadastro de revenda em /signup-partner.",
      "Alta manual da filha no menu Minhas empresas.",
    ],
    ...shot(
      "pendente-signup-partner.png",
      "Cadastro real em /signup-partner?partner=4: Parceiro Demo Kit, 14 dias de trial."
    ),
  },
  {
    title: "Licença e bloqueio",
    lead:
      "Licença ativa com data de fim é o interruptor. Sem ela, o acesso da filha cai. Bloquear inadimplente não apaga histórico — o cliente volta quando pagar, com as conversas no lugar.",
    bullets: [
      "License active + endDate futura = operação no ar.",
      "Parceiro pode bloquear a filha sem wipe de dados.",
      "Se a licença de vocês vencer, as filhas param junto — ver slide de risco na longa.",
    ],
    ...shot("f24-parceiro-licencas.png", "Licença ativa mensal da filha"),
  },
  {
    title: "Recorrência",
    lead:
      "A conta com a plataforma costuma acompanhar quantos clientes/planos estão ativos. O dono da instância vê o consolidado; você vê as suas filhas. Comissão e preço de rua são contrato, não tela.",
    bullets: [
      "Planos por quantidade de clientes ativos.",
      "Relatório consolidado na plataforma (dono).",
      "Preço que você cobra a filha: regra comercial de vocês.",
    ],
    ...pendente(
      "pendente-partner-billing.png",
      "Grave /partner-billing-report (dono da plataforma): consolidado de período das filhas."
    ),
  },
  {
    title: "Dual channel no argumento de venda",
    lead:
      "Para o cliente do parceiro: Oficial quando tem volume e orçamento Meta; Baileys para piloto. O aviso de risco de conta pessoal precisa ir no contrato da filha — senão o problema volta em vocês.",
    bullets: [
      "Oficial: volume, template, menos “conta pessoal”.",
      "Baileys: QR, custo baixo, risco de ban — falar na venda.",
      "Os dois canais existem no mesmo produto que vocês revendem.",
    ],
    ...shot("f16-admin-conexao-qrcode.png", "Conexão no status QR CODE"),
  },
  {
    title: "O que você não precisa",
    lead:
      "Postgres, Redis, sessão Baileys em disco, Traefik: isso é da operação da plataforma. O parceiro precisa de comercial, onboarding da filha e suporte de uso — não de DevOps do stack.",
    bullets: [
      "Sem servidor próprio para o core do Taktchat.",
      "Sem operar Redis, Bull ou arquivos de sessão.",
      "Documentação de produto: kit em .docs/kit-produto/.",
    ],
    ...pendente(
      "pendente-infra-docker.png",
      "Grave o terminal com docker compose ps (postgres + redis healthy) — slide de “isso não é problema do parceiro”."
    ),
  },
  {
    title: "Como começar",
    lead:
      "Trial do parceiro + uma filha piloto (no kit: Cliente Demo Kit). Um admin da filha, uma fila, um QR. Só escala o segundo cliente quando o primeiro ticket real fechou.",
    bullets: [
      "Trial do parceiro (prazo configurável, em geral 14 dias).",
      "Uma filha piloto com licença ativa.",
      "Primeiro QR no número do cliente piloto — não no seu.",
    ],
    ...shot("f23-parceiro-empresas-filhas.png", "Cliente Demo Kit como piloto"),
  },
  {
    title: "CTA",
    lead:
      "Sair da reunião com três números: comissão, data do trial da filha e data do primeiro QR. Sem data, não houve parceria — houve apresentação.",
    bullets: [
      "Alinhar comissão e o que entra no trial.",
      "Nomear o admin da primeira filha.",
      "Marcar o dia do primeiro QR.",
    ],
    ...shot("f17-admin-qrcode-modal.png", "Primeiro QR da filha"),
  },
];

const comercialParceiroLonga = [
  ...comercialParceiroPadrao,
  {
    title: "Hierarquia",
    kicker: "Extensão da versão longa",
    lead:
      "Plataforma no topo, você no meio, clientes embaixo. Quem é super enxerga a instância inteira. O parceiro não “vira dono do SaaS”: vira operador da sua fatia.",
    bullets: [
      "platform → whitelabel → direct.",
      "super = dono da instância, não o comercial do parceiro.",
      "Filha não vê irmã: isolamento por companyId.",
    ],
    ...shot("f23-parceiro-empresas-filhas.png", "Filhas no painel do parceiro"),
  },
  {
    title: "Planos próprios",
    lead:
      "O catálogo pode ter planos com alvo whitelabel (o que a plataforma vende a você) e planos da sua empresa (o que você oferece à filha). Não misturar os dois na conversa comercial.",
    bullets: [
      "targetType whitelabel: relação plataforma ↔ parceiro.",
      "Planos da sua empresa: o que a filha assina com você.",
      "Confirmar na UI de financeiro/planos do ambiente real.",
    ],
    ...pendente(
      "pendente-planos-whitelabel.png",
      "Grave a tela de planos/financeiro do parceiro com catálogo próprio visível (se existir no ambiente)."
    ),
  },
  {
    title: "Token de signup",
    lead:
      "Em vez de criar cada filha à mão, você manda um link com signupToken. O cliente se cadastra sozinho e já nasce debaixo do parceiro certo — menos erro operacional.",
    bullets: [
      "Link público com token, sem senha na URL.",
      "O token amarra a nova empresa a vocês.",
      "Útil para escala; o piloto ainda pode ser alta manual.",
    ],
    ...shot(
      "pendente-signup-token.png",
      "Cadastro real com token na URL: mesmo formulário, plano Revenda Starter Kit visível."
    ),
  },
  {
    title: "Cobrança",
    lead:
      "A plataforma tira snapshot de período para saber o que faturar. O relatório /partner-billing-report é do dono. Você acompanha licenças e status das filhas no seu painel.",
    bullets: [
      "Snapshots de período (não é boleto dentro do chat).",
      "Dono: consolidado. Parceiro: filhas e licenças.",
      "Régua de bloqueio por inadimplência: combinada no contrato.",
    ],
    ...pendente(
      "pendente-partner-billing.png",
      "Grave /partner-billing-report: tabela de período / valores (sem dado real de produção)."
    ),
  },
  {
    title: "Risco operacional",
    lead:
      "Se a licença do parceiro vence, todas as filhas param no mesmo dia. Isso precisa estar no SLA com a plataforma e no contrato com o cliente final — senão o WhatsApp deles cai e a culpa parece de vocês.",
    bullets: [
      "Licença do parceiro = guarda-chuva das filhas.",
      "Antecedência de renovação: combinada (não deixar no vencimento).",
      "Bloqueio pontual de uma filha ≠ derrubar o parceiro inteiro.",
    ],
    ...shot("f24-parceiro-licencas.png", "Licença: o interruptor da operação"),
  },
  {
    title: "Demo",
    lead:
      "Roteiro curto: painel do parceiro (empresas + licenças) e depois login da filha (Carlos admin / Beatriz atendente) no ticket. O prospect precisa ver os dois lados na mesma reunião.",
    bullets: [
      "Ana Parceira: Minhas empresas e Licenças.",
      "Carlos: tickets e filas da filha.",
      "Beatriz: aceite e chat — o produto que o cliente usa de verdade.",
    ],
    ...shot("f13-admin-tickets.png", "Carlos (admin da filha) nos tickets"),
  },
  {
    title: "Limites honestos",
    lead:
      "Neste ambiente de kit o whitelabel foi ligado no banco local (tipo + parent). Menu de filhas e licenças já foram percorridos. Não vender como se cada parceiro ganhasse infra dedicada.",
    bullets: [
      "É o mesmo sistema, fatiado por empresa — não um deploy por cliente.",
      "Prints de empresas e licenças: rodada já feita (f23, f24).",
      "Billing consolidado do dono: print ainda pendente.",
    ],
    ...shot("f22-parceiro-tickets-menu.png", "Menu do parceiro no ambiente local"),
  },
  {
    title: "Fechamento — contrato",
    lead:
      "Antes do QR: contrato de revenda, uso de marca, trial (14 dias é o padrão configurável) e o que acontece no vencimento. Tela não substitui papel.",
    bullets: [
      "Contrato de revenda + marca.",
      "Trial configurável; 14 dias é referência, não lei.",
      "Régua de bloqueio e suporte nível 1 vs 2.",
    ],
    ...pendente(
      "pendente-landing-planos.png",
      "Grave /landing#plans como referência de trial/planos públicos."
    ),
  },
  {
    title: "Fechamento — primeiro cliente no ar",
    lead:
      "Definição de “no ar”: filha criada, licença ativa, 1 conexão, 1 fila, 1 admin e 1 atendente. Campanha e flow ficam para a semana 2.",
    bullets: [
      "Checklist mínimo: filha + licença + QR + fila.",
      "Um número só no piloto.",
      "Data da primeira mensagem real no WhatsApp do cliente.",
    ],
    ...shot("f19-admin-filas.png", "Filas da filha prontas para o piloto"),
  },
];

const tecnicaPadrao = [
  {
    title: "Taktchat — visão técnica",
    kicker: "Técnica · padrão · 12–15 min",
    lead:
      "Reunião para quem vai integrar, hospedar ou auditar o stack. Não é tour de tela: é mapa de blocos, tenancy, canal WhatsApp e o que quebra se o .env apontar para o lugar errado.",
    bullets: [
      "Audiência: dev, infra, integrador.",
      "Produto: atendimento WhatsApp multi-tenant.",
      "Detalhe de cada tela: kit em .docs/kit-produto/.",
    ],
    ...shot("f1-login.png", "SPA React atrás do login"),
  },
  {
    title: "Produto em uma frase",
    lead:
      "SPA React consome uma API Node. O estado que o usuário vê no painel (ticket, mensagem, conexão) chega por REST e é empurrado ao vivo por Socket.IO.",
    bullets: [
      "Frontend: React 17 + MUI, porta 3000 em local.",
      "Backend: Express / TypeScript, porta 8080.",
      "Não é app nativo de WhatsApp: é operação em cima do canal.",
    ],
    ...shot("f3-atendente-chat-maria.png", "O painel que o Socket.IO alimenta"),
  },
  {
    title: "Blocos",
    lead:
      "Quatro peças que precisam estar no ar juntos. Sem Postgres a API até sobe e o health denuncia. Sem Redis, filas Bull e alguns jobs não andam. Sem frontend, só REST.",
    bullets: [
      "Frontend React 17 / MUI v5 / CRACO.",
      "Backend Node 22 / Express / Sequelize.",
      "PostgreSQL 15 + Redis 6.2 / Bull.",
      "Socket.IO no mesmo backend da API.",
    ],
    ...pendente(
      "pendente-infra-docker.png",
      "Grave docker compose ps (postgres 15 + redis) e, se couber, o /health no browser."
    ),
  },
  {
    title: "Mensagem",
    lead:
      "O WhatsApp nunca grava direto na tela. Entra num adapter (Baileys ou Meta), vira ticket/message no Postgres, e o painel escuta o socket. Integrar “por fora” sem esse caminho duplica conversa.",
    bullets: [
      "WhatsApp → adapter baileys | oficial.",
      "Persistência: ticket + message (companyId).",
      "Push: Socket.IO para a sessão do usuário.",
    ],
    ...shot("f17-admin-qrcode-modal.png", "Ponta Baileys: QR da sessão"),
  },
  {
    title: "Do contato ao ticket",
    lead:
      "A unidade de negócio não é a mensagem solta. FindOrCreateTicketService: localiza contato pelo número, reusa ticket ainda aberto naquela conexão, ou cria pending/bot/lgpd. CreateTicketService é o caminho inverso (a equipe inicia).",
    bullets: [
      "Entrada: WhatsApp → adapter → contato → FindOrCreate.",
      "Já existe open/pending/bot/… do mesmo contato+conexão: incrementa e segue.",
      "Saída: Contatos → CreateTicketService (já open, com userId).",
      "Duas abertas do mesmo par contato+conexão: o serviço bloqueia.",
    ],
    ...shot("f2-atendente-tickets-lista.png", "O painel lista tickets, não chats órfãos"),
  },
  {
    title: "Multi-tenant",
    lead:
      "Quase toda tabela de negócio carrega companyId. Os tipos de empresa (platform, whitelabel, direct) definem hierarquia e o que o menu mostra — não são três codebases.",
    bullets: [
      "Isolamento por companyId, não por database por cliente.",
      "platform / whitelabel / direct (+ parentCompanyId na filha).",
      "Mídia e sessão também respeitam a empresa.",
    ],
    ...shot("f23-parceiro-empresas-filhas.png", "Empresa filha (direct) sob whitelabel"),
  },
  {
    title: "Auth",
    lead:
      "JWT depois do login. super ignora quase tudo. profile admin vs user, array permissions[] e flags antigas convivem. Licença vencida corta o acesso mesmo com senha certa.",
    bullets: [
      "JWT no header; não misturar token no log.",
      "super, profile, permissions[], flags legadas.",
      "CompanyAccessService: licença active + endDate.",
    ],
    ...shot("f18-admin-usuarios.png", "Perfis na empresa"),
  },
  {
    title: "Dual channel",
    lead:
      "channelType no registro da conexão escolhe o adapter. Baileys guarda creds e sessão em disco (private/sessions). Oficial fala Cloud API. Os dois podem coexistir na mesma company.",
    bullets: [
      "channelType: baileys | oficial.",
      "Baileys: QR + arquivos de sessão no servidor.",
      "Oficial: credenciais WABA — sem QR de celular pessoal.",
    ],
    ...shot("f15-admin-conexoes-disconnected.png", "Conexão Baileys ainda sem creds.json"),
  },
  {
    title: "Filas",
    lead:
      "Bull no Redis processa campanha, validação de número e outros jobs. Cron à parte cuida de coisas como tags e vencimento de licença. Derrubar o Redis no horário de disparo é incidente visível.",
    bullets: [
      "Bull: campanha, validação, jobs assíncronos.",
      "Cron: tags, licenças, rotinas de manutenção.",
      "Fila de atendimento (queue) é outra entidade — não confundir com Bull.",
    ],
    ...pendente(
      "pendente-bull-redis.png",
      "Grave Redis/Bull: tela de campanhas com job ou um recorte do log do worker (sem secrets)."
    ),
  },
  {
    title: "Integrações",
    lead:
      "Além do painel: REST autenticada, webhooks de saída, widget.js no site do cliente e Typebot/flow. EntrySource marca se o ticket veio de lead, revenda, widget ou WhatsApp.",
    bullets: [
      "REST / webhooks (API externa no plano).",
      "widget.js + token por empresa.",
      "Typebot / Flow Builder quando o plano libera.",
    ],
    ...pendente(
      "pendente-widget-chat-site.png",
      "Grave o widget.js na landing ou a página de ajuda EntrySource /helps/entrysource-chat-site."
    ),
  },
  {
    title: "Local",
    lead:
      "Compose sobe Postgres e Redis. Backend npm run dev (ou dev:fast) na 8080, com migrations. Frontend na 3000 — se herdar PORT=8080 do .env do backend, o SPA não sobe. Health em GET /health.",
    bullets: [
      "docker compose up -d postgres redis (porta 5433 se 5432 ocupada).",
      "Backend :8080 · frontend PORT=3000.",
      "GET /health: API + database.",
    ],
    ...pendente(
      "pendente-health.png",
      "Grave o JSON de GET /health no browser (http://localhost:8080/health) com database ok."
    ),
  },
  {
    title: "Produção (alto nível)",
    lead:
      "O desenho de produção desta instância é Docker Swarm, volumes persistentes e Traefik na frente. Detalhe operacional está em .docs/infraestrutura/ — não improvisar .env de prod no notebook.",
    bullets: [
      "Swarm + volumes (sessões WhatsApp e mídia).",
      "Traefik / TLS na borda.",
      "Runbook: .docs/infraestrutura/ e ATUALIZACAO_SERVIDOR.md.",
    ],
    ...pendente(
      "pendente-arquitetura.png",
      "Grave um diagrama simples (ou a capa de .docs/infraestrutura) — boxes frontend / API / Postgres / Redis / WhatsApp."
    ),
  },
  {
    title: "Atenção",
    lead:
      "Três jeitos clássicos de se machucar: sessão Baileys sumindo (volume sem persistir), job de campanha sem Redis, e .env local apontando para banco de produção. Anti-ban é cadência, não um botão mágico.",
    bullets: [
      "Sessão WhatsApp é estado em disco — backup do volume importa.",
      "Jobs dependem de Redis saudável.",
      "Nunca apontar DB_HOST de prod no .env de desenvolvimento.",
    ],
    ...shot("f16-admin-conexao-qrcode.png", "Sessão WhatsApp é estado, não config"),
  },
  {
    title: "Docs",
    lead:
      "Kit por audiência (esta demanda) vive em .docs/kit-produto/. Arquitetura e módulos antigos continuam em visao-geral/ e funcionalidades/. Em dúvida de produto vs código, o kit descreve o que foi validado na UI.",
    bullets: [
      "Kit: .docs/kit-produto/ (manuais, comercial, prints).",
      "Legado: .docs/visao-geral/ e funcionalidades/.",
      "Player /apresentacoes exige login (kit comercial da operação).",
    ],
    ...pendente(
      "pendente-docs-kit.png",
      "Grave o explorer da pasta .docs/kit-produto/ (README + entregaveis) no editor."
    ),
  },
];

const tecnicaLonga = [
  ...tecnicaPadrao,
  {
    title: "Ticket no código",
    kicker: "Extensão da versão longa",
    lead:
      "Entrada de mensagem usa FindOrCreateTicketService (CRM de conversa: contato + ticket aberto ou novo). Saída usa CreateTicketService. Aceite, transferência e encerramento passam por UpdateTicketService. Status não é só open/pending/closed.",
    bullets: [
      "FindOrCreate (in) · Create (out) · Update (aceite/transfer/encerra).",
      "Status: pending, open, closed, bot, lgpd, nps, group.",
      "Sem WhatsApp CONNECTED, Update que manda mensagem no canal falha.",
    ],
    ...shot("f7-atendente-modal-transferir.png", "Transferência: UpdateTicketService na prática"),
  },
  {
    title: "Permissões",
    lead:
      "PermissionAdapter no backend e usePermissions no frontend. super bypass. admin tem fallback amplo. user soma base + flags. O 403 da atendente no dashboard é o adapter funcionando.",
    bullets: [
      "Super bypass; admin fallback; user = base + flags.",
      "tickets.create / transfer: atendente do seed pode não ter.",
      "Menu some ou a rota devolve 403 — os dois existem.",
    ],
    ...shot("f12-atendente-dashboard-403.png", "Atendente na home: 403 — permissão real"),
  },
  {
    title: "Licença",
    lead:
      "Empresa platform passa no CompanyAccessService sempre. whitelabel e direct precisam de License com status active e endDate no futuro. É o mesmo mecanismo do slide comercial de bloqueio.",
    bullets: [
      "platform: sempre ok (dona da instância).",
      "whitelabel/direct: License active + endDate > agora.",
      "Bloqueio não precisa dropar o banco — só a checagem de acesso.",
    ],
    ...shot("f24-parceiro-licencas.png", "License active no painel"),
  },
  {
    title: "LGPD e tenant",
    lead:
      "Flags nas CompaniesSettings por empresa. Arquivos de mídia no volume namespaced. Regra de ouro de código: não logar token, senha, CPF, corpo de mensagem em logger.debug de produção.",
    bullets: [
      "Settings por company, não globais cegas.",
      "Volume de mídia por tenant.",
      "Proibido: console/logger com secret ou dado pessoal.",
    ],
    ...shot("f20-admin-settings.png", "Settings da empresa"),
  },
  {
    title: "Schema",
    lead:
      "Fonte de verdade do banco: migrations Sequelize em backend/src/database/migrations. O kit local rodou as que faltavam (type, parent, Licenses, entrySource). SequelizeMeta atrasado = sintoma clássico neste projeto.",
    bullets: [
      "Não “inventar coluna” no SQL solto em prod sem migration.",
      "Kit local: type, parentCompanyId, Licenses, entrySource.",
      "Drift: ver .docs/operacao/recuperacao-migrations-banco.md.",
    ],
    ...pendente(
      "pendente-migrations.png",
      "Grave a pasta backend/src/database/migrations no explorer (lista de arquivos, sem .env)."
    ),
  },
  {
    title: "Pontos frágeis",
    lead:
      "Três pegadinhas que esta demanda encontrou de verdade: Baileys sem creds.json (QR ainda não escaneado), frontend herdando PORT do backend, overlay de health no first paint da landing.",
    bullets: [
      "Sem creds.json: conexão DISCONNECTED, mensagem real não sai.",
      "Frontend: unset PORT && PORT=3000.",
      "Lista /tickets sem queueIds: count 0 (filtro, não seed vazio).",
    ],
    ...shot("f15-admin-conexoes-disconnected.png", "Sem QR escaneado = sem envio real"),
  },
  {
    title: "Próximas rodadas técnicas",
    lead:
      "O que o kit ainda não fechou no hardware: escanear o QR e gravar CONNECTED. UI de campanhas/flow foi documentada sem print desta rodada. Filtro queueIds já está entendido — não “corrigir” apagando o filtro.",
    bullets: [
      "QR no celular → sessão CONNECTED → envio/transfer reais.",
      "Prints pendentes: campanhas, flow, /health, billing dono.",
      "Não tratar count 0 sem queueIds como bug de seed.",
    ],
    ...pendente(
      "pendente-whatsapp-connected.png",
      "Grave /connections com a sessão CONNECTED (bolinha verde) depois de escanear o QR no celular."
    ),
  },
];

export const DECKS = [
  {
    id: "comercial-cliente-padrao",
    audience: "Empresa cliente",
    title: "Primeira reunião comercial",
    usage: "Pitch de 12–15 min: WhatsApp vira ticket (CRM de conversa), sem jargão de revenda.",
    size: "Reunião curta",
    duration: "12–15 min",
    slides: comercialClientePadrao,
  },
  {
    id: "comercial-cliente-longa",
    audience: "Empresa cliente",
    title: "Proposta e onboarding",
    usage: "Quando já há interesse: jornada do ticket, papéis, campanha, IA e piloto. CRM de conversa com números.",
    size: "Reunião longa",
    duration: "proposta / onboarding",
    slides: comercialClienteLonga,
  },
  {
    id: "comercial-parceiro-padrao",
    audience: "Revenda / parceiro",
    title: "Primeira reunião de parceria",
    usage: "Pitch de 10–12 min do modelo whitelabel: o que você vende e o que não opera.",
    size: "Reunião curta",
    duration: "10–12 min",
    slides: comercialParceiroPadrao,
  },
  {
    id: "comercial-parceiro-longa",
    audience: "Revenda / parceiro",
    title: "Contrato e operação da revenda",
    usage: "20 slides para fechar parceria: hierarquia, licença, cobrança, risco e primeiro cliente.",
    size: "Reunião longa",
    duration: "proposta / onboarding",
    slides: comercialParceiroLonga,
  },
  {
    id: "tecnica-padrao",
    audience: "Dev, infra ou integrador",
    title: "Visão técnica rápida",
    usage: "12–15 min de stack, tenancy, dual channel e o que não apontar no .env.",
    size: "Reunião curta",
    duration: "12–15 min",
    slides: tecnicaPadrao,
  },
  {
    id: "tecnica-longa",
    audience: "Dev, infra ou integrador",
    title: "Deep dive técnico",
    usage: "20 slides: ticket no código, permissões, licença, schema e pontos frágeis deste ambiente.",
    size: "Reunião longa",
    duration: "deep dive",
    slides: tecnicaLonga,
  },
];

export function getDeck(deckId) {
  return DECKS.find((deck) => deck.id === deckId) || null;
}
