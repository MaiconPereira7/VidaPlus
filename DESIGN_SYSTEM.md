# VidaPlus — Design System

Documentação do design system **funcional** do VidaPlus, extraída diretamente do código-fonte.
Nada aqui é aspiracional: cada valor tem origem em um arquivo do projeto, indicado ao lado.

> **Fontes de verdade**
>
> | O quê | Onde |
> | --- | --- |
> | Tokens de cor, sombras, utilitários tipográficos, animações, foco | [`src/index.css`](src/index.css) |
> | Cores categóricas (tipos de compromisso) | [`src/lib/agenda.js`](src/lib/agenda.js) → `APPOINTMENT_TYPES` |
> | Humor, status de exame, dias da semana | [`src/lib/health.js`](src/lib/health.js) |
> | Notas SUS / categorias NPS | [`src/lib/surveys.js`](src/lib/surveys.js) |
> | Componentes reutilizáveis | [`src/components/`](src/components/) |
> | Tema claro/escuro | [`src/context/ThemeContext.jsx`](src/context/ThemeContext.jsx) + script inline em [`index.html`](index.html) |
>
> O projeto usa **Tailwind CSS v4** (`@tailwindcss/vite`). Não existe `tailwind.config.js`: os tokens
> são declarados no bloco `@theme` de `index.css` e viram classes utilitárias automaticamente.

---

## Sumário

1. [Cores](#1-cores)
2. [Tipografia](#2-tipografia)
3. [Espaçamento e layout](#3-espaçamento-e-layout)
4. [Border-radius](#4-border-radius)
5. [Sombras, elevação e camadas](#5-sombras-elevação-e-camadas)
6. [Movimento](#6-movimento)
7. [Componentes](#7-componentes)
8. [Estados](#8-estados)
9. [Ícones e emojis](#9-ícones-e-emojis)
10. [Modo escuro](#10-modo-escuro)
11. [Mapa de tokens CSS → Tailwind](#11-mapa-de-tokens-css--tailwind)
12. [Inconsistências conhecidas](#12-inconsistências-conhecidas)

---

## 1. Cores

### 1.1 Primária (marca / ação / sucesso)

O verde-esmeralda é a cor da marca, das ações principais e do estado de "concluído/saudável".

| Token CSS | Classe Tailwind | Claro | Escuro | Uso |
| --- | --- | --- | --- | --- |
| `--accent` | `bg-accent`, `text-accent`, `border-accent`, `ring-accent` | `#059669` | `#34d399` | Botões primários, item ativo da navegação, dia selecionado, checkbox marcado, "Plus" do logo |
| `--accent-hover` | `bg-accent-hover`, `text-accent-hover` | `#047857` | `#10b981` | Hover de botões primários; texto verde sobre fundo verde-claro (contraste) |
| `--accent-light` | `bg-accent-light` | `#ecfdf5` | `#064e3b` | Fundo do ícone do logo, faixa "Todos os medicamentos foram tomados" |
| `--accent-glow` | `bg-accent-glow` | `rgba(5,150,105,.12)` | `rgba(52,211,153,.08)` | Halo do humor selecionado (`box-shadow: 0 0 0 3px`), pulso do ponto do logo |

`<meta name="theme-color" content="#059669">` em `index.html` pinta a barra do navegador mobile com a mesma cor.

### 1.2 Neutros (superfícies e texto)

| Token CSS | Classe | Claro | Escuro | Uso |
| --- | --- | --- | --- | --- |
| `--bg-primary` | `bg-bg-primary` | `#fafafa` | `#0a0a0a` | Fundo da página |
| `--bg-secondary` | `bg-bg-secondary` | `#ffffff` | `#0a0a0a` | Fundo de inputs, trilhos de abas segmentadas, chips de horário |
| `--bg-card` | `bg-bg-card` | `#ffffff` | `#171717` | Cards, modais, menus |
| `--text-primary` | `text-text-primary` | `#0a0a0a` | `#fafafa` | Títulos, valores, texto principal |
| `--text-secondary` | `text-text-secondary` | `#525252` | `#a3a3a3` | Rótulos, descrições, botões neutros |
| `--text-muted` | `text-text-muted` | `#a3a3a3` | `#525252` | Placeholders, legendas, ícones inativos, metadados |
| `--border-color` | `border-border`, `bg-border`, `divide-border` | `#e5e5e5` | `#262626` | Bordas, divisores, trilho de barras/anéis de progresso |

Hover neutro (sobreposição translúcida, não é token): `hover:bg-black/[0.04]` no claro e
`dark:hover:bg-white/[0.06]` no escuro (variações `0.03`/`0.05` em linhas de tabela e navegação).

### 1.3 Semânticas

| Significado | Token | Classe | Valor | Onde aparece |
| --- | --- | --- | --- | --- |
| **Sucesso** | `--accent` | `bg-accent`, `text-accent` | `#059669` / `#34d399` | Toast de sucesso, status de exame "Normal", missão concluída, NPS "Promotor" |
| **Erro / perigo** | `--danger` | `bg-danger`, `text-danger` | `#dc2626` | Toast de erro, mensagens de validação, botão "Excluir"/"Sair", status "Crítico", NPS "Detrator" |
| **Atenção** | `--amber` | `bg-amber`, `text-amber` | `#d97706` | Status "Atenção", missão "Em andamento", NPS "Neutro", remédio pendente |
| **Informação** | `--info` | `bg-info`, `text-info` | `#2563eb` | Barras de distribuição no painel de resultados, hover dos botões de água |
| **Info (toast)** | — | `bg-[#3f3f46]` | `#3f3f46` | Toast do tipo `info` ("Medicamento removido.", "Sessão expirou") |

`--danger`, `--amber`, `--info` e `--purple` **não mudam no modo escuro** (mesmo valor nos dois temas).

Padrão de **fundo tingido** para semânticas: cor a 10% de opacidade + texto na cor cheia.

```
bg-accent/10 text-accent-hover dark:text-accent   → sucesso
bg-amber/10  text-amber                           → atenção
bg-danger/10 text-danger                          → erro
```

### 1.4 Categóricas — tipos de compromisso

Definidas em `APPOINTMENT_TYPES` ([`src/lib/agenda.js`](src/lib/agenda.js)). São aplicadas via `style`
inline (não há classe Tailwind correspondente), com fundo `${cor}1a` (sufixo hex `1a` ≈ 10% de opacidade).

| Categoria | Cor | Observação |
| --- | --- | --- |
| Consulta | `#2563eb` (azul) | Igual a `--info` |
| Exame | `#7c3aed` (roxo) | Igual a `--purple`; também usada para exames do prontuário no calendário |
| Lembrete | `#d97706` (âmbar) | Igual a `--amber` |
| Outro | `#737373` (cinza) | Fallback de `typeMeta()` para tipos desconhecidos |

### 1.5 Cores por métrica de saúde (Home)

Constantes `BLUE`, `AMBER`, `PURPLE` em [`src/pages/HomePage.jsx`](src/pages/HomePage.jsx). Cada métrica mantém a mesma cor
no card, no anel de progresso, na barra e no "Resumo do dia".

| Métrica | Cor | Ícone |
| --- | --- | --- |
| Remédios | `var(--accent)` | `Pill` |
| Hidratação | `#2563eb` | `Droplets` |
| Passos | `#d97706` | `Footprints` |
| Humor | `#7c3aed` | `Smile` |

### 1.6 Humor

`MOOD_OPTIONS` em [`src/lib/health.js`](src/lib/health.js):

| Valor | Emoji | Rótulo | Cor |
| --- | --- | --- | --- |
| 1 | 😢 | Péssimo | `#dc2626` |
| 2 | 🙁 | Ruim | `#d97706` |
| 3 | 😐 | Ok | `#737373` |
| 4 | 🙂 | Bem | `#2563eb` |
| 5 | 😄 | Ótimo | `#059669` |

> As cores de humor estão definidas nos dados, mas a interface atual mostra o humor com o emoji
> e com o destaque verde do botão selecionado — a cor própria de cada humor não é renderizada.

### 1.7 Escalas de avaliação (UX)

**NPS — botões 0–10** (`scoreStyle()` em [`NpsPage.jsx`](src/pages/avaliacao/NpsPage.jsx)):

| Nota | Fundo | Texto |
| --- | --- | --- |
| 0–3 | `var(--danger)` | `#fff` |
| 4–6 | `var(--amber)` | `#fff` |
| 7–8 | `#facc15` | `#000` |
| 9–10 | `var(--accent)` | `#fff` |

**Notas SUS** (`susGrade()` em [`surveys.js`](src/lib/surveys.js), espelhada no backend):

| Score | Nota | Rótulo | Cor |
| --- | --- | --- | --- |
| ≤ 25 | F | Pior imaginável | `#dc2626` |
| ≤ 51 | D | Ruim | `#f97316` |
| ≤ 68 | C | OK | `#eab308` |
| ≤ 80 | B | Bom | `#22c55e` |
| > 80 | A | Excelente | `#16a34a` |

**Gradiente do medidor SUS** (`SusGauge`): `#dc2626 → #d97706 → #eab308 → #84cc16 → #059669` (0/25/50/75/100%).

### 1.8 Gradientes de marca

| Onde | Valor |
| --- | --- |
| Avatar com iniciais (TopNav, Perfil) | `linear-gradient(135deg, #059669, #2563eb)` |
| Painel lateral do Login (desktop) | `linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)` + padrão de pontos brancos a 6% |

---

## 2. Tipografia

### 2.1 Família

- **Inter Variable**, importada por `@fontsource-variable/inter` em [`src/main.jsx`](src/main.jsx) (sem dependência de Google Fonts).
- Pilha declarada no `body`: `"InterVariable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Fonte única em todo o produto; hierarquia criada só por tamanho, peso e cor.

### 2.2 Classes tipográficas semânticas (`@layer components`)

| Classe | Tamanho | Peso | Extras | Uso |
| --- | --- | --- | --- | --- |
| `.page-title` | 28px | 700 | `letter-spacing: -0.02em`, `--text-primary` | Título de página (Saúde, Agenda, Perfil, Testes) |
| `.stat-number` | 32px | 700 | `-0.02em`, `font-variant-numeric: tabular-nums` | Número central do anel de hidratação |
| `.card-title` | 15px | 600 | `--text-primary` | Título de modais |
| `.section-label` | 13px | 600 | `uppercase`, `letter-spacing: 0.05em`, `--text-secondary` | Rótulo de seção ("Resumo do dia", "Principais achados") |
| `.meta-label` | 12px | 500 | `--text-secondary` | Cabeçalho de card ("Check-in de humor", "Medicamentos de hoje") |

### 2.3 Escala em uso (classes Tailwind)

| Tamanho | Classe | Ocorrências | Uso típico |
| --- | --- | --- | --- |
| 10px | `text-[10px]` | 17 | Rótulos da barra inferior, dias da semana do calendário, chips de categoria pequenos, legendas de escala |
| 11px | `text-[11px]` | 16 | Badges de status, legenda do calendário, metadados de lista |
| 12px | `text-xs` | 69 | Rótulos de formulário, mensagens de erro, descrições, botões compactos |
| 13px | `text-[13px]` | 4 | Rótulos de humor, opções de múltipla escolha, abas de resultados |
| 14px | `text-sm` | 84 | **Texto base**: corpo, inputs, itens de lista, botões |
| 15px | `text-[15px]` | 5 | Botão de login, botão "Novo compromisso", títulos de missão |
| 16px | `text-base` | 5 | Mês do calendário, título do cabeçalho de pesquisa |
| 18px | `text-lg` | 4 | Nome no Perfil, valores do "Resumo do dia" |
| 20px | `text-xl` | 11 | Perguntas das pesquisas, logo da TopNav, valores de indicadores |
| 24px | `text-2xl` | 8 | Saudação "Olá, Nome 👋" (mobile), contagem de passos no anel, telas de agradecimento |
| 28px | `text-[28px]` | 3 | Valores dos indicadores semanais da Saúde |
| 30px | `text-3xl` | 6 | Saudação (desktop), headline do Login, números do NPS |
| 36px | `text-4xl` | 2 | Nota final NPS/SUS |
| 48px | `text-5xl` | 1 | Score médio SUS no painel |
| 64px | `text-[64px]` | 1 | Score NPS no painel |

### 2.4 Pesos

| Peso | Classe | Ocorrências | Uso |
| --- | --- | --- | --- |
| 300 | `font-light` | 1 | "Vida" no logo da TopNav |
| 400 | `font-normal` | 2 | "Vida" no componente `Logo`, dosagem do medicamento |
| 500 | `font-medium` | 68 | Rótulos, itens de lista, botões neutros |
| 600 | `font-semibold` | 69 | Botões primários, badges, títulos de card |
| 700 | `font-bold` | 38 | Títulos, números, "Plus" do logo |

### 2.5 Espaçamento entre letras e linhas

- `tracking-tight` (24×) em títulos e números grandes; `-0.02em` nas classes `.page-title`/`.stat-number`.
- `tracking-wide`/`tracking-widest` + `uppercase` em rótulos de seção, dias da semana e abas.
- `leading-snug` nas perguntas das pesquisas; `leading-none` nos emojis e no score NPS.

---

## 3. Espaçamento e layout

### 3.1 Contêiner de página (`AppLayout`)

```
mx-auto w-full max-w-screen-2xl
px-5 md:px-10 lg:px-16        → gutter lateral 20 / 40 / 64 px
pt-6                          → 24 px abaixo da TopNav
pb-24 md:pb-10                → 96 px no mobile (espaço da BottomNav de 68 px)
```

Pesquisas usam `SurveyShell`, com coluna estreita `max-w-[520px]` (`max-w-5xl` no painel de resultados) e `px-4 py-8`.

### 3.2 Ritmo vertical e grids

| Contexto | Valor |
| --- | --- |
| Entre blocos de uma página | `space-y-5` (20 px) |
| Gap padrão de grids de cards | `gap-4` (16 px); `gap-6` entre calendário e lista na Agenda |
| Grids responsivos | Home: `grid-cols-1 lg:grid-cols-2`, inferior `md:grid-cols-2 lg:grid-cols-4`; Saúde: `md:grid-cols-3` |
| Campos de formulário | `space-y-3` (12 px); login `space-y-3.5` |
| Ícone + texto | `gap-1.5` (cabeçalhos de card) a `gap-3` (itens de lista) |
| Lista com divisores | `divide-y divide-border`, itens `py-2.5 first:pt-0 last:pb-0` |

Mais usados: `gap-2` (30×), `gap-3` (29×), `gap-1.5` (28×), `gap-4` (14×).

### 3.3 Padding interno

| Elemento | Padding |
| --- | --- |
| Card | `p-4` (16 px) → `md:p-5` (20 px) |
| Modal | `p-5` |
| Card de login | `p-6` |
| Input | `px-3 py-2.5` (login `py-3 pl-10`) |
| Botão primário | `py-2.5` largura total ou `px-4 py-2`/`px-6 py-2.5` |
| Botão-ícone | `p-1.5` |

### 3.4 Breakpoints

Breakpoints padrão do Tailwind. Os relevantes no produto:

- **`< md` (< 768 px)** — mobile: BottomNav visível, TopNav sem links, faixa rolável de resumo, modal vira *bottom sheet*, FAB "Novo compromisso".
- **`md` (≥ 768 px)** — TopNav mostra os links (só ícones), BottomNav some, card "Resumo do dia" aparece.
- **`lg` (≥ 1024 px)** — TopNav mostra ícone + texto, layouts em 2 colunas, painel ilustrado no Login.
- **`sm` (≥ 640 px)** — modal centralizado com cantos arredondados.

---

## 4. Border-radius

| Classe | Valor | Ocorrências | Uso |
| --- | --- | --- | --- |
| `rounded-[4px]` | 4 px | 2 | Checkbox de medicamento / tarefa de missão |
| `rounded-md` | 6 px | 4 | Aba ativa de controles segmentados |
| `rounded-lg` | 8 px | 55 | **Padrão de controles**: inputs, botões de formulário, botões-ícone, mensagens de erro |
| `rounded-xl` | 12 px | 26 | Card (mobile), células do calendário, caixas de ícone, botões grandes, Likert |
| `rounded-2xl` | 16 px | 3 | Card (≥ md), modal (≥ sm), banner de missões |
| `rounded-t-2xl` | 16 px no topo | 1 | Modal como *bottom sheet* no mobile |
| `rounded-full` | 9999 px | 49 | Pílulas, badges, chips, toasts, avatar, botões +/−, FAB, botões de humor |

Regra prática do código: **controle = `lg`, contêiner = `xl`/`2xl`, rótulo/estado = `full`**.

---

## 5. Sombras, elevação e camadas

### 5.1 Sombras

Tokens do `@theme` (substituem a escala padrão do Tailwind):

| Classe | Valor |
| --- | --- |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,.05)` |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05)` |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -4px rgba(0,0,0,.04)` |

Sombras específicas:

| Elemento | Sombra |
| --- | --- |
| Card (repouso) | `0 1px 2px rgba(0,0,0,.03), 0 2px 8px rgba(0,0,0,.04)` |
| Card (hover) | `0 2px 4px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.06)` |
| Botão "Novo compromisso" | `0 6px 20px rgba(5,150,105,.45)` |
| Nota NPS selecionada | `0 4px 14px ${cor}55` |

**No modo escuro, sombras são substituídas por bordas**: `dark:shadow-none dark:border-border`.

### 5.2 Camadas (z-index)

| z | Elemento |
| --- | --- |
| `z-10` | Cabeçalho fixo das pesquisas |
| `z-20` | Barra de ações fixa das pesquisas (mobile) |
| `z-30` | FAB "Novo compromisso" |
| `z-40` | BottomNav |
| `z-50` | TopNav e Modal (o modal é renderizado em portal no `body`, depois da TopNav) |
| `z-[100]` | Toasts |

### 5.3 Vidro / desfoque

- TopNav: `bg-white/80 backdrop-blur-xl` (`dark:bg-[#0A0A0A]/80`).
- BottomNav: `bg-white/90 backdrop-blur-lg` (`dark:bg-[#111111]/90`).
- Fundo do modal: `bg-black/40 backdrop-blur-sm`.

---

## 6. Movimento

### 6.1 Animações CSS (`index.css`)

| Classe | Keyframes | Duração / curva | Uso |
| --- | --- | --- | --- |
| `.animate-fade-in-up` | opacidade 0→1, `translateY(10px→0)` | 0.4s ease-out, `backwards` | Entrada escalonada de cards (`animationDelay` de 20 a 220 ms) |
| `.animate-fade-in` | `translateY(6px→0)` | 0.25s ease-out | Troca de aba no painel de resultados |
| `.animate-slide-in` | `translateX(20px→0)` | 0.3s `cubic-bezier(.4,0,.2,1)` | Troca de pergunta nas pesquisas |
| `.animate-toast-in-right` | `translateX(24px→0)` | 0.25s ease-out | Entrada de toast |
| `.animate-modal-in` | `scale(.97) translateY(8px)` → normal | 0.18s ease-out | (Definida; o modal hoje usa framer-motion) |
| `.animate-count-pop` | `scale(.9→1)` | 0.3s | (Definida, sem uso atual) |
| `.animate-pulse-dot` | halo `0 → 4px` em `--accent-glow` | 2s infinito | Ponto verde ao lado do logo |
| `stroke-draw` | `stroke-dashoffset → 0` | 0.5s + 0.35s | Desenho do check animado (`AnimatedCheck`) |

Transição global (`@layer base`): `background-color .2s, border-color .2s, color .15s` em todos os elementos — suaviza a troca de tema.

### 6.2 framer-motion

| Onde | Comportamento |
| --- | --- |
| Troca de rota (`AppLayout`) | `opacity 0→1`, `y 8→0`, saída `y -4`; 0.2s, `mode="wait"` |
| Modal | fundo `opacity` 0.15s; painel `scale .97→1` 0.18s |
| Indicador da TopNav e abas segmentadas | `layoutId` com mola (`stiffness 500, damping 35`) |
| Ícone de tema | gira ±90° ao alternar (0.25s) |
| Emoji de humor selecionado | `scale 1.15`, mola (`stiffness 400, damping 15`) |
| Telas de conclusão | `scale .7→1` com mola |
| FAB | `whileTap scale .96` |

Anéis e barras de progresso animam com transição CSS (`stroke-dashoffset 1s ease-out`; `width .5s ease-out`).
Números de resultados usam `useCountUp` (rAF, `easeOutCubic`, 900–1000 ms).

---

## 7. Componentes

### 7.1 Botões

| Variante | Classes-base | Exemplos |
| --- | --- | --- |
| **Primário** | `rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover` | "Adicionar", "Adicionar exame", "Começar", "Ver" |
| Primário grande | `h-12 rounded-lg text-[15px]` (Login) · `rounded-xl py-3` (Testes) · `h-12 rounded-xl px-6 text-[15px]` + sombra verde (Agenda) | "Entrar", "1. Pesquisa de Satisfação", "Novo compromisso" |
| Primário compacto (pílula) | `rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white` | "+ Novo Exame" |
| **Secundário (outline de marca)** | `rounded-xl border border-accent py-3 text-sm font-semibold text-accent hover:bg-accent/5` | "2. NPS — Recomendação" |
| **Outline neutro** | `rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06]` | "Cancelar" do `ConfirmDialog` |
| Outline neutro (pílula) | `rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text-secondary` | "Editar dados" / "Salvar alterações" |
| **Perigo** | `rounded-lg bg-danger py-2.5 text-sm font-semibold text-white hover:opacity-90` | "Excluir", "Sair" (diálogos) |
| Perigo suave | `rounded-xl border border-danger/20 bg-danger/5 text-danger hover:bg-danger/10` | "Sair da conta" |
| **Botão-ícone (ghost)** | `rounded-lg p-1.5 text-text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06]` | Editar/Excluir compromisso, mês anterior/próximo, voltar |
| Ícone circular de ação | `h-7 w-7 rounded-full bg-accent text-white` | "+" de medicamento |
| Contador (+/−) | `h-10 w-10 rounded-full border border-border` com `enabled:hover:bg-info` | Água |
| Pílula de ajuste | `rounded-full border px-3 py-1 text-xs` | Passos: **adicionar** em âmbar tingido (`border-amber/40 bg-amber/10 text-amber`), **corrigir** em contorno discreto com hover `danger` |
| **FAB estendido (mobile)** | `fixed bottom-24 right-4 h-14 rounded-full bg-accent pl-5 pr-6 text-[15px] font-semibold` | "Novo compromisso" |
| **Link textual** | `text-xs font-semibold text-accent hover:text-accent-hover` | "Ver tudo →", "Limpar", ação do `EmptyState` |

### 7.2 Card — [`Card.jsx`](src/components/Card.jsx)

```
rounded-xl p-4 md:rounded-2xl md:p-5
bg-bg-card border border-border/50
shadow-[0_1px_2px_rgba(0,0,0,.03),0_2px_8px_rgba(0,0,0,.04)]
dark:border-border dark:shadow-none
```

- `hoverable` (padrão `true`): sombra maior no hover; no escuro, borda `#333`.
- Variações por composição: borda esquerda colorida de 3 px (`border-l-[3px]` + `borderLeftColor`) para compromissos e exames na Agenda; ícone decorativo de 48 px a 7% de opacidade no canto dos indicadores da Saúde; `border-accent/30 bg-accent/5` para missão concluída.

### 7.3 Inputs e formulários

| Elemento | Classes |
| --- | --- |
| Input / select / textarea padrão | `w-full rounded-lg border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary outline-none ring-accent/40 focus:ring-2` |
| Input com ícone (Login) | igual, com `py-3 pl-10` e `focus:border-accent`; ícone de 18 px em `absolute left-3.5`, `text-text-muted` |
| Busca compacta | `py-1.5 pl-8 text-xs` + ícone `Search` 14 px |
| Input centralizado | `bg-bg-primary px-4 py-3 text-center` (nome do respondente, código de acesso) |
| Rótulo | `mb-1 block text-xs font-medium text-text-secondary` |
| Mensagem de erro | `rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger` com `role="alert"` |
| Upload de PDF | `<label>` com `border border-dashed rounded-lg px-3 py-2.5 text-xs`; estados idle (`Upload`), lendo (`Loader2` girando), lido (`CheckCircle2`, borda/fundo verde), erro |
| Textarea | `resize-none`, `rows` 3–5 |

### 7.4 Seletores

| Componente | Descrição |
| --- | --- |
| **Controle segmentado** (Login: Entrar/Cadastrar; Resultados: abas) | Trilho `rounded-lg bg-bg-secondary p-1`; aba ativa com fundo `bg-bg-card shadow-sm rounded-md` deslizante (`layoutId`) e texto `text-accent` |
| **Tipo de compromisso** | `grid-cols-4 gap-2`, botões `rounded-lg border py-2 text-[11px] font-semibold`; selecionado ganha fundo `${cor}1a` e texto na cor da categoria |
| **Status do exame** | Três botões `flex-1 rounded-lg border py-2 text-xs`; selecionado recebe o estilo do badge de status |
| **Dias da semana** (medicamento) | Sete botões `h-9 flex-1 rounded-lg border text-xs` (D S T Q Q S S); ativo `bg-accent text-white`; `aria-pressed` |
| **Humor** | Pílulas `rounded-full border px-4 py-2.5` com emoji 20 px + rótulo 13 px; ativa `border-accent bg-accent/10 text-accent` + halo `--accent-glow`; inativas `opacity-70` |
| **Likert 1–5** ([`LikertScale.jsx`](src/components/LikertScale.jsx)) | Barra única `rounded-xl border` com segmentos divididos por `border-r`; ativo `bg-accent text-white`; legendas extremas em 10 px |
| **NPS 0–10** | Quadrados `h-11 w-11 rounded-xl`; selecionado preenchido na cor da faixa, `scale-110` e sombra colorida |
| **Múltipla escolha** (Satisfação) | Pílulas `rounded-full border px-5 py-2.5 text-[13px]`; selecionada `bg-accent text-white` |
| **Switch** (modo escuro) | Trilho `h-6 w-11 rounded-full` (`bg-accent` ligado / `bg-border` desligado), botão branco 20 px deslizando `translate-x-5`; `role="switch"` + `aria-checked` |

### 7.5 Modal e diálogo de confirmação

**[`Modal.jsx`](src/components/Modal.jsx)** — renderizado via portal no `body`.

- Mobile: *bottom sheet* (`items-end`, `rounded-t-2xl`); ≥ `sm`: centralizado, `rounded-2xl`, `max-w-lg`.
- Painel `bg-bg-card p-5 shadow-lg max-h-[90vh] overflow-y-auto`; no escuro `border-border` sem sombra.
- Cabeçalho: título `.card-title` + botão fechar (`X` 20 px, `rounded-full p-1.5`).
- Fecha por **Esc**, clique no fundo ou no X; trava o scroll do `body` enquanto aberto.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no título.

**[`ConfirmDialog.jsx`](src/components/ConfirmDialog.jsx)** — `Modal` + descrição `text-sm text-text-secondary` + dois botões `flex-1` (Cancelar outline neutro · ação em `bg-danger`, ou `bg-accent` com `danger={false}`). Usado em: sair da conta (TopNav e Perfil) e excluir exame.

### 7.6 Toast — [`ToastContext.jsx`](src/context/ToastContext.jsx)

Pílula `rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg`, canto superior direito
(`top-4 right-4`, `md:top-6 md:right-6`), empilhável, some após **2,6 s**.

| Tipo | Fundo | Ícone |
| --- | --- | --- |
| `success` (padrão) | `bg-accent` | `CheckCircle2` |
| `error` | `bg-danger` | `XCircle` |
| `info` | `bg-[#3f3f46]` | `Info` |

### 7.7 Badges de status

| Badge | Classes | Variantes |
| --- | --- | --- |
| **Status do exame** (`EXAM_STATUS_STYLES`) | `rounded-full px-2.5 py-1 text-[11px] font-semibold` | Normal `bg-accent/10 text-accent-hover dark:text-accent` · Atenção `bg-amber/10 text-amber` · Crítico `bg-danger/10 text-danger` |
| **Categoria NPS** | `rounded-full px-2 py-0.5 font-bold` | Promotor (verde) · Neutro (âmbar) · Detrator (vermelho) |
| **Nota SUS** | Quadrado `h-14 w-14 rounded-xl text-xl font-bold text-white` na cor da nota | A–F |
| **Missão** | `rounded-full px-2.5 py-1 text-[11px] font-semibold` | Concluída `bg-accent/15` · Em andamento `bg-amber/15 text-amber` · Pendente `bg-border/60 text-text-secondary` |
| **Tendência de humor** | `rounded-full px-2 py-0.5 text-[11px] font-semibold` + ícone 12 px | Melhor (verde, `TrendingUp`) · Pior (vermelho, `TrendingDown`) · Estável (neutro, `Minus`) |
| **Horário** | `rounded-full bg-bg-secondary px-2.5 py-1 text-[11px] font-medium` + `Clock` 12 px | Horário do medicamento |

### 7.8 Chips de categoria (tipo de compromisso)

```jsx
<span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"   // 11px na Home
      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}>
  {appt.type}
</span>
```

**Legenda** abaixo dos calendários: ponto `h-2 w-2 rounded-full` na cor + rótulo `text-[11px] font-medium text-text-secondary`.

### 7.9 Navegação

**TopNav** ([`TopNav.jsx`](src/components/TopNav.jsx)) — `sticky top-0`, altura `h-14` / `md:h-16`, vidro desfocado, borda inferior.

- Esquerda: logo textual ("Vida" `font-light` + "Plus" `font-bold text-accent`, 20 px) + ponto verde pulsante.
- Centro (≥ md): links com ícone 16 px; texto a partir de `lg`. Ativo: `text-accent font-semibold` + sublinhado de 2 px que desliza entre itens.
- Direita: alternar tema (sol/lua) e avatar de 34 px com iniciais em gradiente, que abre menu (`w-56 rounded-xl`) com nome, e-mail e "Sair" em vermelho.

**BottomNav** ([`BottomNav.jsx`](src/components/BottomNav.jsx)) — só `< md`, `fixed bottom-0`, altura 68 px + `safe-area-inset-bottom`.

- 4 itens iguais (Home, Saúde, Agenda, Perfil): ícone 20 px (`strokeWidth 1.5`) + rótulo `text-[10px] font-medium`.
- Ativo: ícone `text-accent` + ponto de 3 px abaixo do rótulo. Inativo: `text-text-muted`.

**SurveyShell** ([`SurveyShell.jsx`](src/components/SurveyShell.jsx)) — cabeçalho fixo com "voltar", título, contador "N de M" e barra de progresso de 3 px em `bg-accent`.

### 7.10 Calendário — [`MiniCalendar.jsx`](src/components/MiniCalendar.jsx)

- Cabeçalho: setas `ChevronLeft/Right` (botões-ícone) + "Mês Ano" `text-base font-semibold`.
- Grade `grid-cols-7 gap-1 md:gap-1.5`; dias da semana `D S T Q Q S S` em `text-[10px] uppercase tracking-widest text-text-muted`.
- Célula: `h-9 md:h-12 rounded-xl text-sm font-medium`.

| Estado da célula | Estilo |
| --- | --- |
| Normal | `text-text-primary`, hover neutro |
| Hoje | `text-accent ring-2 ring-accent/30` |
| Selecionado | `bg-accent text-white` |
| Com evento | Sublinhado interno de 2 px na cor da 1ª categoria (`box-shadow: inset 0 -2px 0 0 cor`) |
| Vários eventos | + até 2 pontos de 4 px com as cores seguintes (brancos quando selecionado) |

O mês exibido acompanha a data selecionada quando ela muda por fora.

### 7.11 Progresso circular e linear

**[`ProgressRing.jsx`](src/components/ProgressRing.jsx)** — SVG com dois círculos (trilho `var(--border-color)` + arco colorido
`strokeLinecap="round"`), girado −90° para começar no topo. Props: `size` (100), `strokeWidth` (6), `color`, `children` (conteúdo central).
Na Home: hidratação (azul, número em `.stat-number` + "/ 8") e passos (âmbar, "4.2k" + "/ 6k").

**[`ProgressBar.jsx`](src/components/ProgressBar.jsx)** — trilho `rounded-full bg-border` (`h-2` padrão, `h-1` nos cards da Home) com preenchimento animado.
Variações: segmentos de missão (`h-1.5 flex-1 rounded-full`, `bg-accent`/`bg-border`) e `BarRow` do painel de resultados.

**[`SusGauge.jsx`](src/components/SusGauge.jsx)** — semicírculo de 220 px, traço de 14 px com gradiente vermelho→verde e ponteiro em `var(--text-primary)`.

### 7.12 Checkbox de medicamento

```
botão h-[18px] w-[18px] rounded-[4px] border
  desmarcado: border-border
  marcado:    border-accent bg-accent + <Check size=12 strokeWidth=3 text-white>
```

Cada linha: ponto de status 6 px (âmbar = pendente, verde = tomado, cinza = não é dia) → checkbox → nome
(`text-sm font-medium`; tomado = `line-through text-text-muted`) + dosagem → chip de horário → lixeira
(visível no hover em ≥ md). Remédios de "dias específicos" fora do dia aparecem com `opacity-60`, sem checkbox e com "Hoje não · seg, qua".
Quando todos do dia são tomados: faixa `bg-accent-light` "Todos os medicamentos do dia foram tomados!".
O mesmo quadrado (sem interação) marca as tarefas das missões na página Testes.

### 7.13 Outros

| Componente | Descrição |
| --- | --- |
| **EmptyState** | Ícone 40 px `text-text-muted` + título `text-sm font-medium` + descrição `text-xs` (máx. 240 px) + link de ação opcional |
| **StatTile** | Ícone 16 px + valor `text-sm font-bold` + rótulo `text-[11px]` (painel de resultados) |
| **Indicador semanal** (Saúde) | Card com rótulo `.meta-label` e valor `text-[28px] font-bold` |
| **Resumo do dia** | Caixa de ícone `h-10 w-10 rounded-xl` com fundo `${cor}1a` + valor `text-lg font-bold` + rótulo 11 px; no mobile vira faixa rolável horizontal |
| **Linha do tempo de humor** | 7 círculos (`h-9 w-9`, hoje `h-10 w-10 border-accent`) sobre uma linha de 1 px, com emoji ou "–" e o dia da semana abaixo |
| **Tabela** (exames, NPS, SUS) | `text-sm`/`text-xs`, cabeçalho `text-text-muted`, linhas `border-b border-border` zebradas (`even:bg-black/[0.015]`), contêiner `overflow-x-auto` |
| **Logo** | Caixa `rounded-xl bg-accent-light` com `HeartPulse` + "Vida**Plus**"; tamanhos `sm`/`md`/`lg`; slogan opcional em itálico 11 px |
| **AnimatedCheck** | Círculo + check SVG desenhados em sequência (telas de conclusão) |
| **Loader** | Anel `h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent` |

---

## 8. Estados

| Estado | Padrão no código |
| --- | --- |
| **Hover** | Primário: `hover:bg-accent-hover`. Neutro: `hover:bg-black/[0.04]` / `dark:hover:bg-white/[0.06]`. Texto: `hover:text-text-primary` ou `hover:text-accent-hover`. Perigo: `hover:text-danger`, `hover:bg-danger/10`. Card: sombra maior. Avatar: `hover:scale-105`. Ações só no hover em desktop: `md:opacity-0 md:group-hover:opacity-100` |
| **Hover condicionado** | `enabled:hover:*` nos botões que podem ser desabilitados (+/− de água e passos), para o destaque não aparecer quando inativos |
| **Active / selected** | Preenchimento `bg-accent text-white` (dia, Likert, múltipla escolha, dias da semana) ou tingido `bg-accent/10 text-accent border-accent` (humor); navegação: `text-accent` + indicador; categorias: fundo `${cor}1a` |
| **Pressionado** | `whileTap={{ scale: 0.96 }}` no FAB |
| **Disabled** | `disabled:cursor-not-allowed` + `disabled:opacity-30` (contadores, "Voltar"), `opacity-40` (avançar pesquisa) ou `opacity-50/60` (envio) |
| **Carregando** | Texto do botão troca ("Aguarde...", "Salvando...", "Enviando...") e o botão fica desabilitado; listas mostram "Carregando..." em `text-text-muted`; `Loader2` girando no upload de PDF |
| **Foco** | Global: `outline: 2px solid var(--accent); outline-offset: 2px` em `:focus-visible` de botões, links, inputs e `[role=button]`. Inputs: `focus:ring-2 ring-accent/40` |
| **Erro** | Caixa `bg-danger/10 text-danger` acima do botão de envio (`role="alert"`) ou toast `error` para falhas de API |
| **Sucesso** | Toast verde; faixas/selos verdes de "concluído"; `AnimatedCheck` em telas finais |
| **Somente leitura** | Ao ver um dia passado na Home, os controles de água/passos são substituídos por "Editável apenas para hoje" |

---

## 9. Ícones e emojis

### 9.1 Biblioteca

**lucide-react**, com `strokeWidth={1.5}` como padrão visual (traço fino). Exceções: `2`/`2.25` em ícones de destaque
(logo, "+" do botão Novo compromisso), `3` no check do checkbox.

Tamanhos: **12** (dentro de badges/chips) · **14–16** (cabeçalhos de card, botões compactos) · **18–20** (navegação, inputs, fechar) · **26** (FAB/logo grande) · **40–48** (estados vazios, ilustrações de fundo).

### 9.2 Mapa de ícones

| Conceito | Ícone |
| --- | --- |
| Marca / Saúde | `HeartPulse` |
| Home · Agenda · Perfil | `Home` · `Calendar` / `CalendarDays` · `User` |
| Humor | `Smile` |
| Hidratação | `Droplets` |
| Passos | `Footprints` |
| Medicamentos | `Pill` |
| Lembretes | `BellRing` |
| Exames / prontuário | `FileText` |
| Dia sem compromissos | `CalendarOff` |
| Horário | `Clock` |
| Adicionar · Remover · Corrigir | `Plus` · `Minus` · `Undo2` |
| Editar · Excluir · Salvar | `Pencil` · `Trash2` · `Check` |
| Concluído | `CheckCircle2`, `AnimatedCheck` |
| Importar PDF | `Upload`, `Loader2` |
| Busca · Expandir | `Search` · `ChevronDown` |
| Tema | `Sun` / `Moon` |
| Sair | `LogOut` |
| Acesso restrito | `Lock`, `ShieldCheck` |
| Avaliações | `ClipboardList`, `ClipboardCheck`, `Gauge` (NPS), `BarChart3` (SUS), `LineChart` (resultados), `Users` |
| Indicadores | `Activity`, `TrendingUp`, `TrendingDown` |
| Navegação | `ArrowLeft`, `ArrowRight`, `ArrowUpRight`, `ChevronLeft`, `ChevronRight` |
| Login | `Mail`, `Lock`, `Eye`/`EyeOff`, `User`, `Cake` (nascimento) |
| Toasts | `CheckCircle2`, `XCircle`, `Info` |

### 9.3 Emojis

| Emoji | Onde |
| --- | --- |
| 😢 🙁 😐 🙂 😄 | Escala de humor (1 a 5) — check-in, "Ontem:", linha do tempo e "Humor mais frequente" |
| 👋 | Saudação "Olá, Nome 👋" na Home |
| 🧪 | Banner "Teste o VidaPlus! 🧪" |
| 🎉 | "Todas as missões concluídas! 🎉" |

---

## 10. Modo escuro

- **Estratégia:** classe `.dark` no `<html>` com a variante customizada `@custom-variant dark (&:where(.dark, .dark *));`.
- **Persistência:** `ThemeContext` salva `"light"`/`"dark"` em `localStorage["vidaplus_theme"]`. Padrão: **claro** (não segue `prefers-color-scheme`).
- **Sem flash:** um script inline em `index.html` aplica `.dark` antes do React carregar.
- **Controles:** botão sol/lua na TopNav e switch "Modo escuro" no Perfil.
- **`color-scheme`** muda junto (`light`/`dark`), então inputs nativos e barras de rolagem acompanham.

**O que muda** (`html.dark` em `index.css`): todos os neutros e a família `accent` (tabelas da seção 1).
**O que não muda:** `--danger`, `--amber`, `--info`, `--purple`, cores categóricas e de métricas.

Ajustes pontuais com `dark:` nos componentes:

| Padrão | Uso |
| --- | --- |
| `dark:shadow-none dark:border-border` | Cards, modais, menus, card de login: elevação vira borda |
| `dark:hover:bg-white/[0.06]` | Hover neutro |
| `dark:text-accent` | Texto verde sobre fundo tingido (no claro usa `text-accent-hover` para contraste) |
| `dark:bg-accent/15` | Fundo do ícone do logo/RespondentGate |
| `dark:bg-[#0A0A0A]/80`, `dark:bg-[#111111]/90` | TopNav e BottomNav |
| `dark:bg-[#171717]`, `dark:bg-[#1a1a1a]` | Menu do usuário, indicadores da visão gerencial |
| `dark:hover:border-[#333]` | Hover de card |
| `dark:even:bg-white/[0.02]` | Zebra das tabelas |

---

## 11. Mapa de tokens CSS → Tailwind

| Variável em `:root` / `html.dark` | Token `@theme` | Classes geradas (exemplos) |
| --- | --- | --- |
| `--bg-primary` | `--color-bg-primary` | `bg-bg-primary` |
| `--bg-secondary` | `--color-bg-secondary` | `bg-bg-secondary` |
| `--bg-card` | `--color-bg-card` | `bg-bg-card` |
| `--text-primary` | `--color-text-primary` | `text-text-primary` |
| `--text-secondary` | `--color-text-secondary` | `text-text-secondary` |
| `--text-muted` | `--color-text-muted` | `text-text-muted`, `placeholder:text-text-muted` |
| `--border-color` | `--color-border` | `border-border`, `bg-border`, `divide-border`, `border-border/50` |
| `--accent` | `--color-accent` | `bg-accent`, `text-accent`, `border-accent`, `ring-accent/40`, `bg-accent/10` |
| `--accent-light` | `--color-accent-light` | `bg-accent-light` |
| `--accent-hover` | `--color-accent-hover` | `bg-accent-hover`, `text-accent-hover` |
| `--accent-glow` | `--color-accent-glow` | `bg-accent-glow` (e `var(--accent-glow)` em sombras) |
| `--info` | `--color-info` | `bg-info`, `border-info`, `text-info` |
| `--purple` | `--color-purple` | `bg-purple`, `text-purple` (no código: `var(--purple)`) |
| `--amber` | `--color-amber` | `bg-amber`, `text-amber`, `bg-amber/10`, `border-amber/40` |
| `--danger` | `--color-danger` | `bg-danger`, `text-danger`, `bg-danger/10`, `border-danger/20` |
| — | `--shadow-sm` / `--shadow-md` / `--shadow-lg` | `shadow-sm`, `shadow-md`, `shadow-lg` |

Em SVG e `style` inline, os componentes usam as variáveis diretamente: `var(--accent)`, `var(--border-color)`, `var(--text-primary)`, `var(--danger)`, `var(--amber)`.

---

## 12. Inconsistências conhecidas

Pontos observados no código que valem padronizar numa próxima iteração:

1. **Hex duplicando tokens.** `BLUE`/`AMBER`/`PURPLE` da Home, `APPOINTMENT_TYPES` e `MOOD_OPTIONS` repetem `#2563eb`, `#d97706` e `#7c3aed` em vez de `var(--info)`, `var(--amber)` e `var(--purple)`.
2. **Mesma cor, dois significados.** Azul é ao mesmo tempo "Hidratação" e "Consulta"; âmbar é "Passos", "Lembrete" e "Atenção"; roxo é "Humor" e "Exame".
3. **Semânticas iguais nos dois temas.** `--danger`, `--amber`, `--info` e `--purple` não têm versão para o modo escuro.
4. **Logo em dois pesos.** TopNav usa "Vida" `font-light`; o componente `Logo` usa `font-normal`.
5. **Tamanhos arbitrários próximos da escala.** `text-[12px]` ao lado de `text-xs` (12 px); `text-[28px]` repete `.page-title` sem usar a classe.
6. **Cores de humor não usadas.** `MOOD_OPTIONS[].color` existe mas não é renderizada.
7. **Animações definidas e não usadas.** `.animate-modal-in` e `.animate-count-pop`.
8. **Contraste de `--text-muted`.** `#a3a3a3` sobre branco (~2,5:1) e `#525252` sobre `#0a0a0a` (~2,5:1) ficam abaixo do mínimo WCAG AA para texto (4,5:1) — ver DESIGN.md, seção Acessibilidade.
