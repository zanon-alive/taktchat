export const TOUR_PATH = "/tour";
export const TOUR_LEGACY_PATH = "/p/tour";
export const TOUR_LEAD_PATH = "/landing#lead-form";
export const TOUR_OG_IMAGE = "https://taktchat.com.br/landing/f3-atendente-chat-maria.png";
export const TOUR_OG_TITLE = "TaktChat em 1 minuto";
export const TOUR_OG_DESCRIPTION =
  "O cliente continua no WhatsApp dele. A empresa ganha fila, dono e histórico — sem atender no celular.";

export const tourSlides = [
  {
    id: "antes",
    title: "O WhatsApp da empresa, fora do celular",
    lead: "TaktChat resolve o atendimento quando ele ainda mora no aparelho: a conversa some, não tem dono, não tem fila. Campanha no mesmo número que atende queima o chip.",
    audience:
      "Para quem já vive de WhatsApp — suporte, vendas, financeiro — e precisa de mais de uma pessoa no mesmo número. Admin configura, supervisor vê o quadro, atendente fecha a conversa.",
    oneLiner: "O cliente não muda de app; a empresa para de atender no achismo.",
    pains: [
      { title: "Conversa some", text: "O histórico fica no aparelho de uma pessoa." },
      { title: "Não tem dono", text: "Quem pegar, pegou." },
      { title: "Mesmo número, dois usos", text: "Disparo e atendimento no mesmo chip." },
    ],
  },
  {
    id: "nao-e-web",
    title: "Não é WhatsApp Web",
    lead: "A mensagem vira ticket: responsável, histórico e mesa. Não substitui CRM de pipeline — é o CRM do canal WhatsApp. O cliente continua no app dele.",
    image: "/landing/f3-atendente-chat-maria.png",
    imageAlt: "Tela de atendimento do TaktChat: conversa no WhatsApp com a fila de tickets ao lado",
  },
  {
    id: "mesa",
    title: "A mesa do time",
    lead: "Aguardando, aceito, resolvido. A fila mostra o que está na mesa — não o achismo de quem abriu o celular por último.",
    image: "/landing/f2-atendente-tickets-lista.png",
    imageAlt: "Lista de tickets do TaktChat com conversas em andamento",
  },
  {
    id: "automacao",
    title: "O que se repetir, some da fila",
    lead: "Fluxos para o atendimento que não precisa de uma pessoa na primeira resposta.",
    image: "/landing/pendente-flow-builder.png",
    imageAlt: "Construtor de fluxos de automação do TaktChat",
  },
  {
    id: "ao-vivo",
    title: "Quer ver ao vivo?",
    lead: "O cliente não muda de app; a empresa para de atender no achismo. A gente mostra na operação de vocês — sem cadastro neste link.",
    ctaLabel: "Falar com especialista",
    ctaTo: TOUR_LEAD_PATH,
  },
];

export const GALLERY_TOUR_SLIDE = {
  "/landing/f2-atendente-tickets-lista.png": 3,
  "/landing/pendente-flow-builder.png": 4,
};

export function parseTourSlideParam(search, total = tourSlides.length) {
  const query = typeof search === "string" ? search.replace(/^\?/, "") : "";
  const raw = Number.parseInt(new URLSearchParams(query).get("s"), 10);
  if (!Number.isFinite(raw) || raw < 1) {
    return 0;
  }
  return Math.min(raw, total) - 1;
}

export function tourSearchForIndex(index) {
  if (!index) {
    return "";
  }
  return `?s=${index + 1}`;
}
