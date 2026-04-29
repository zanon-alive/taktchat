# Assets estáticos do frontend (Create React App)

## Onde colocar ficheiros

| Local | Conteúdo | URL em produção |
|--------|----------|-----------------|
| `frontend/public/` | Tudo o que o browser pede na **raiz** do site (`/favicon.ico`, `/logo.png`, `/logo_quadrado.png`, `robots.txt`, etc.) | `https://taktchat.com.br/<nome>` |
| `frontend/src/assets/` (ou imports relativos) | Imagens e media **importados** no JS/JSX | O bundler gera path em `/static/media/...` (hash) |

O build do CRA **copia** o conteúdo de `public/` para a raiz de `build/`. A imagem Docker Nginx publica `build/` em `/usr/share/nginx/html`.

## Git

- A pasta **`frontend/public/` tem de ser versionada** para o pipeline (GHCR, `docker build`) incluir esses ficheiros.
- A regra genérica `public` no **`.gitignore` da raiz** foi removida em favor de `backend/public` (uploads do API), para não esconder `frontend/public` acidentalmente.

## Evitar 404

- Não use `src="/algum.png"` no JSX sem ter `frontend/public/algum.png` no repositório.
- Alternativa: `import logo from "../assets/logo.png"` e `src={logo}` (não depende de `public/`).
- Não reutilize paths de exemplos do MUI (ex.: `/static/images/avatar/1.jpg`) sem o ficheiro em `public/` — preferir `import` ou iniciais no `Avatar`.

## Nginx (imagem `taktchat-frontend`)

Ficheiros com extensão conhecida (`.png`, etc.) são servidos com `try_files $uri =404` — se o ficheiro não estiver no build, a resposta é 404 (não é fallback para `index.html`).

## Conteúdo atual em `frontend/public/` (versionado)

Além de ícones e `logo_quadrado.png`, o repositório inclui variantes de marca (`TaktChat*.png`, `taktchat-logo_150x150.png`), `robots.txt`, `sitemap.xml` e a pasta `originais/` (cópias de referência). Evite nomes com espaços em novos ficheiros na raiz (`logo quadrado.png` existe por histórico local — preferir `logo_quadrado.png`).
