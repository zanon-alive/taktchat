# Inventário de imagens (assets)

Este documento lista **todas as imagens versionadas no repositório** e os dados necessários para o time de design refatorar/substituir os arquivos (melhor resolução/qualidade e logos novos) **sem quebrar imports/uso no frontend**.

## Escopo e observações

- **Escopo**: arquivos com extensões `svg`, `png`, `jpg/jpeg`, `webp`, `gif`, `ico` dentro do repositório.
- **Resultado atual**: foram encontrados **4 arquivos**, todos em `frontend/src/assets/` e todos com extensão `.svg`.
- **Referências no código**: não foi encontrada referência direta aos nomes desses arquivos nos fontes do `frontend` (pode indicar que estão **não utilizados** ou que são carregados por outro caminho).

## Tabela de imagens

> Convenções:
> - **Peso**: tamanho do arquivo em bytes (e aproximado em KB).
> - **Dimensões**: em SVG, é preferível usar `viewBox` como referência principal; `width/height` pode existir como sugestão de render.

| ID | Arquivo | Localização | Formato | Peso | Dimensões (width/height) | `viewBox` | Uso no código | Notas |
|---:|---|---|---|---:|---|---|---|---|
| 1 | `google-calendar-96.svg` | `frontend/src/assets/google-calendar-96.svg` | SVG* | 3759 B (~3.7 KB) | `96px` / `96px`* | `0 0 48 48`* | **Não encontrado** por nome | *O conteúdo está em formato de **módulo JS gerado por SVGR** (não é um XML SVG “cru”). Os atributos acima aparecem no `React.createElement(\"svg\", ...)`. Recomenda-se substituir por um SVG padrão (XML) para simplificar manutenção.* |
| 2 | `bg.svg` | `frontend/src/assets/bg.svg` | SVG | 25892 B (~25.3 KB) | `1009.54` / `839.64` | `0 0 1009.54 839.64` | **Não encontrado** por nome | Indício de ser background/ilustração. |
| 3 | `togitalk.svg` | `frontend/src/assets/togitalk.svg` | SVG | 310639 B (~303.4 KB) | `1500px` / `1200px` | *(ausente)* | **Não encontrado** por nome | Arquivo grande para SVG; provável logo/ilustração com muitos pontos. Recomenda-se otimização agressiva (SVGO). |
| 4 | `avatar.svg` | `frontend/src/assets/avatar.svg` | SVG | 2255 B (~2.2 KB) | `698` / `698` | `0 0 698 698` | **Não encontrado** por nome | Possível avatar padrão. |

## Especificações para o design (para substituir sem quebrar o projeto)

### Requisitos gerais (obrigatórios)

- **Manter nomes e caminhos**: entregar os arquivos finais com **o mesmo nome** e no **mesmo caminho** (ex.: `frontend/src/assets/avatar.svg`), para evitar ajustes no código.
- **Não depender de raster dentro do SVG**: evitar `<image href="data:...">` dentro do SVG (isso aumenta peso e perde escalabilidade).
- **Otimização**: rodar otimização tipo **SVGO** (ou ferramenta equivalente) antes de entregar.
- **Cores e temas**:
  - Se o SVG precisa funcionar em tema claro/escuro, preferir **`currentColor`** (quando aplicável) ou entregar variações (ex.: `logo-light.svg`/`logo-dark.svg`) — *neste projeto ainda não há variações nomeadas, então só faça isso se você também for ajustar o código*.
- **Compatibilidade**: garantir que os SVGs renderizam corretamente em navegadores modernos (Chrome/Edge/Firefox) e em React.

### Requisitos de layout/tamanho (para não “estourar” o UI)

- **`viewBox` deve ser preservado**:
  - `google-calendar-96.svg`: `viewBox="0 0 48 48"`
  - `bg.svg`: `viewBox="0 0 1009.54 839.64"`
  - `avatar.svg`: `viewBox="0 0 698 698"`
  - `togitalk.svg`: **não possui** `viewBox` hoje (recomendado adicionar mantendo o enquadramento visual).
- **`width/height`**:
  - Preferível **remover** `width/height` fixos e deixar o dimensionamento por CSS quando possível; se mantiver, garantir que combina com o `viewBox`.
  - Se o componente/uso atual esperar um tamanho específico (ex.: “96px”), manter essa proporção visual.

### Entregáveis recomendados (se o objetivo é “melhor resolução/qualidade”)

Como estes assets são SVG (vetoriais), “melhor resolução” costuma significar:
- **Melhor desenho/traço**, alinhamento, consistência de grid.
- **Menor peso** sem perder fidelidade (otimização).

Ainda assim, caso você precise de assets raster (para outros canais), pedir ao design também:
- **PNG @2x e @3x** com fundo transparente (quando fizer sentido) e tamanho alvo definido por tela/uso.
- **Versões de logo**: horizontal, vertical, ícone quadrado, monocromático.

## Pendências / pontos para confirmar

- **Mapeamento de uso**: não foi localizado uso direto desses nomes no código do `frontend`. Se você me indicar **em quais telas** essas imagens aparecem (logo, background, avatar etc.), eu consigo rastrear o ponto exato e adicionar na coluna “Uso no código” com precisão.

