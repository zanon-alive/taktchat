# Landing, widget e canais de entrada

## Landing `/landing`

Página pública (título: *Revolucione seu Atendimento no WhatsApp*). Seções vistas nesta versão:

- Prova social e pilares (estabilidade, omnichannel, campanhas, dados)
- Problemas que resolve (desorganização, automação, risco de ban, métricas, campanhas, multi-atendente)
- Funcionalidades (tickets, dual channel, IA, relatórios, APIs)
- Planos **Básico R$ 99** / **Premium R$ 299** / **Enterprise R$ 799** (valores da landing, não necessariamente iguais ao banco)
- Convite a revendedor
- FAQ (celular conectado, número atual, fidelidade, limite de usuários, suporte)

Overlay *Servidor de API indisponível* aparece se o health do backend falhar no carregamento — nesta sessão o health em `localhost:8080/health` respondeu ok depois que o backend subiu.

## Login `/login`

Marca TaktChat, *Conectando pessoas, acelerando negócios*, e-mail, senha, lembrar, esqueci senha, atalho de documentação.

## Widget e canais

Configuração em **Settings** (admin): canais de entrada, `useSiteChat`, snippet do `widget.js` e token por empresa. Cadastro público `/signup` e `/signup-partner`.

## Status

Landing e login: **exercitados**. Widget/API: **implementados**, mas o embed em site externo não foi exercitado.

## Limitação

O Lead público escolhe a primeira empresa quando não recebe seleção explícita. Não apresentar esse fluxo como roteamento multiempresa maduro.
