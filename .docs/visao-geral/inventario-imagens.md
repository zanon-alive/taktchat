# Inventário de imagens (assets)

Este documento lista imagens versionadas no repositório para o time de design substituir arquivos sem quebrar o frontend.

## Escopo

- Extensões: `svg`, `png`, `jpg/jpeg`, `webp`, `gif`, `ico`.
- **`frontend/public/`** — servido na raiz do site em produção (`/logo.png`, `/favicon.ico`, etc.). Estes são os arquivos que importam para a VPS.
- **`frontend/src/assets/`** — só entram no bundle se forem importados no JS.

Guia de uso: `funcionalidades/frontend-assets-estaticos.md`.

## `frontend/public/` (produção)

| Arquivo | Peso aprox. | Notas |
|---|---:|---|
| `TaktChat.png` | 696 KB | Logo grande; evitar na UI crítica (peso). |
| `TaktChat - recortada.png` | 190 KB | Nome com espaços — preferir sem espaços em arquivos novos. |
| `TaktChat_logo.png` | 121 KB | |
| `logo quadrado.png` / `logo_quadrado.png` | 123 KB cada | Duplicata; usar `logo_quadrado.png`. |
| `taktchat-logo_150x150.png` / `logo.png` | 62 KB | |
| `TaktChat_logo_sem_fundo.png` | 24 KB | |
| `TaktChat_logo_sem_fundo.ico` | 46 KB | |
| `android-chrome-192x192.png` | 32 KB | PWA / atalho. |
| `apple-touch-icon.png` | 29 KB | |
| `favicon.png` / `favicon-32x32.png` | 2.5 KB | |
| `favicon-16x16.png` | 1.4 KB | |
| `favicon.ico` | 4.4 KB | |
| `nopicture.png` | 4.1 KB | Fallback de avatar. |
| `originais/` | vários | Cópias de referência; não usar na UI. |

## `frontend/src/assets/` (bundle)

| Arquivo | Peso | Uso no código |
|---|---:|---|
| `google-calendar-96.svg` | ~3.7 KB | Não encontrado por nome (módulo SVGR). |
| `bg.svg` | ~25 KB | Não encontrado por nome. |
| `togitalk.svg` | ~303 KB | Logo legado; otimizar ou remover se morto. |
| `avatar.svg` | ~2.2 KB | Não encontrado por nome. |

## Especificações para o design

- Manter **nomes e caminhos** dos arquivos em `public/` que o HTML/`index.html` já referencia.
- Não criar novos nomes com espaços.
- Otimizar PNG grandes (`TaktChat.png`) e o SVG `togitalk.svg`.
- Preferir SVG XML padrão (não módulo JS) para novos ícones em `src/assets/`.
