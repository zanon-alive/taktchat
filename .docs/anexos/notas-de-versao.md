## Notas de versão

Use este arquivo para registrar mudanças relevantes em cada release.

| Data | Versão | Descrição | Autor |
| --- | --- | --- | --- |
| 2026-08-25 | 2.2.2v-26 | Kit v1.7: overlay do Painel, atalho do funil, login sem tag `#`, heap do frontend. | Equipe Dev |
| 2026-08-25 | 2.2.2v-26 | Kit v1.6: aviso de 8 colunas, desfecho ao Encerrar, ficha comercial, tags `#` da atendente, relatório por lane. | Equipe Dev |
| 2026-08-25 | 2.2.2v-26 | Kanban: quadro `/kanban` lista tickets `closed` que têm lane (`kanban=1`). | Equipe Dev |
| 2026-08-25 | 2.2.2v-26 | Kit: deck técnico alinhado ao WhatsApp CONNECTED; prints `pendente-*` passam a `shot`. | Equipe Dev |
| 2026-08-25 | 2.2.2v-26 | Kanban: lane de entrada e lane ao encerrar (settings por empresa); uma tag kanban por ticket; Encerrar mantém o card no funil. | Equipe Dev |
| 2026-08-25 | 2.2.2v-26 | Overlay de API não bloqueia o first paint; token de signup hex resolve pelo `signupToken` primeiro. | Equipe Dev |
| 2026-08-24 | 2.2.2v-26 | Player `/apresentacoes` privado (login + permissão na empresa plataforma); prints em `backend/private/` via API. Seed do kit permanece só local. | Equipe Dev |
| 2026-08-24 | 2.2.2v-26 | Player: ilustração de IA só no celular (`pendente-whatsapp-celular.png`). | Equipe Dev |
| 2026-08-24 | 2.2.2v-26 | Kit v1.4: WhatsApp CONNECTED, prints do player, transferência persistida; restam captura real do celular/signup. | Equipe Dev |
| 2026-08-22 | 2.2.2v-26 | Kit de produto: player `/apresentacoes`; prints canônicos em `frontend/public/kit-apresentacoes/`. Prints pendentes e QR Baileys no roadmap. | Equipe Dev |
| 2026-08-21 | 2.2.2v-26 | Documentação alinhada à stack da VPS (`14_taktchat.yml` volumes); widget versionado; `.env.example`; onboarding/admin/roadmap atualizados. GHCR documentado como alternativa. | Equipe Dev |
| 2026-04-29 | 2.2.2v-26 | Landing: 403 no config de direct signup; ícones da seção de problemas; assets estáticos em `frontend/public`. | Equipe Dev |
| 2026-02-17 | 2.2.2v-26 | EntrySource e Chat do Site: rastreamento de origem nos tickets (lead, revendedor, site_chat, whatsapp); canais configuráveis em Configurações; formulários Lead/Revendedor na landing; API pública e widget embarcável; siteChatToken para empresas não-whitelabel; card na Central de Ajuda (/helps). | Equipe Dev |
| 2025-02-06 | 2.2.2v-26 | Internacionalização de mensagens de validação: namespace `validation` (required, tooShort, emailInvalid, arrayRequired) em pt, en, es, tr; substituição de "Required" e "too short" hardcoded por i18n nos schemas Yup; `noValidate` em formulários Formik para evitar "Please fill out this field."; tradução pt-BR do checkoutFormModel; correção de LeadForm e outros. | Equipe Dev |
| 2025-02-05 | 2.2.2v-26 | Correção de aninhamento DOM inválido em skeletons de loading: remove TableRowSkeleton de dentro de td/div, cria CardSkeleton para views mobile, melhora TableRowSkeleton com default columns e PropTypes. | Equipe Dev |
| 2025-01-27 | 2.2.2v-26 | Melhorias na Landing Page de Vendas: novos componentes (FAQ, ChatWidget, CookieBanner), SEO avançado com Schema.org, lazy loading, design modernizado. | Equipe Dev |
| 2025-11-07 | 2.2.2v-26 | Reestruturação completa da documentação. | Equipe Docs |
