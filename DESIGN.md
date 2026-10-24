# VidaPlus — Documento de Produto Digital

> **"Sua saúde, centralizada."**

Este documento descreve o VidaPlus como produto: o que ele é, para quem, o que faz, como está organizado e por que
a interface é do jeito que é. Tudo foi levantado a partir do código-fonte deste repositório; quando algo é
**inferência** (e não uma regra explícita no código), isso está sinalizado.

Documentos relacionados: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) (tokens e componentes visuais) e [`README.md`](README.md).

---

## Sumário

1. [Visão do produto e proposta de valor](#1-visão-do-produto-e-proposta-de-valor)
2. [Público-alvo e personas](#2-público-alvo-e-personas)
3. [Funcionalidades principais](#3-funcionalidades-principais)
4. [Arquitetura de informação](#4-arquitetura-de-informação)
5. [Decisões de design](#5-decisões-de-design)
6. [Fluxos principais do usuário](#6-fluxos-principais-do-usuário)
7. [Tecnologias utilizadas](#7-tecnologias-utilizadas)
8. [Acessibilidade](#8-acessibilidade)

---

## 1. Visão do produto e proposta de valor

### O que é

O VidaPlus é um **app web de saúde pessoal**, de uso individual. Ele reúne em um só lugar os registros do dia a dia
(humor, hidratação, passos, medicamentos) e a parte "administrativa" da saúde (consultas, exames, lembretes e o
histórico de resultados).

O comentário no topo de [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) deixa a visão explícita:
> "este é um app de saúde PESSOAL, de uso individual — não uma plataforma clínica com médicos atendendo pacientes."

Por isso existe um único tipo de conta, e todos os dados pertencem à própria pessoa.

### Contexto

Protótipo acadêmico da disciplina de Interação Humano-Computador (rodapé do Perfil: *"VidaPlus v1.0 — Projeto IHC 2026.2"*).
O próprio produto embute o processo de avaliação de usabilidade: missões guiadas de teste, três questionários
padronizados (Satisfação, NPS e SUS) e um painel de resultados para a equipe.

### Proposta de valor

Nas palavras da tela de login:

> "Humor, hidratação, medicamentos, exames e agenda em um só lugar — simples de usar, no seu ritmo."

| Promessa | Como o produto cumpre |
| --- | --- |
| **Centralizar** | Uma Home com humor, água, passos, remédios, calendário e lembretes do dia; exames do prontuário aparecem também no calendário da Agenda |
| **Simples de usar** | Registros de um toque (emoji de humor, +1 copo, +500 passos, marcar remédio); 4 seções fixas na navegação |
| **No seu ritmo** | Metas suaves (8 copos, 6.000 passos), sem cobrança ou notificações invasivas; o dia é a unidade de registro |
| **Nunca esquecer um remédio** | Lista do dia ordenada por horário, com checkbox, contador "x/y" e confirmação visual quando tudo foi tomado |
| **Organizar consultas e exames num só calendário** | Calendário mensal com marcações coloridas por tipo, compartilhado entre Home e Agenda |

---

## 2. Público-alvo e personas

O código não traz personas formais. As personas abaixo são **inferidas** das evidências encontradas no produto
(exemplos de preenchimento, metas, missões de teste e textos), e servem para explicar as escolhas da interface.

### Público-alvo

Adultos que querem acompanhar a própria saúde sem uma ferramenta clínica complexa — em especial quem tem
**rotina de medicação** e **consultas/exames recorrentes** — usando tanto o celular quanto o computador.

Evidências: placeholders "Ex: Losartana" e "Ex: 50mg" (medicamento de uso contínuo), "Ex: Consulta com cardiologista",
"Ex: Hemograma completo", importação de laudos em PDF, layout mobile-first com barra de navegação inferior.

### Personas (inferidas)

**1. Quem faz tratamento contínuo**
- Toma um ou mais remédios todos os dias (ou em dias específicos da semana).
- Precisa saber rapidamente *o que já tomou hoje*.
- No VidaPlus: lista "Medicamentos de hoje" com horário, checkbox e contador no "Resumo do dia"; indicador
  "Dias com medicação completa" na Saúde.

**2. Quem organiza consultas e exames**
- Tem consultas com especialistas, faz exames periódicos e guarda os laudos.
- Quer ver o mês de uma vez e não marcar dois compromissos no mesmo horário.
- No VidaPlus: Agenda com calendário colorido por tipo, bloqueio de conflito de horário no banco, prontuário com
  busca, filtros e importação de PDF.

**3. Quem quer criar hábitos saudáveis**
- Quer registrar como se sente e se está bebendo água e se movimentando.
- No VidaPlus: check-in de humor com emojis, anéis de progresso de água e passos, histórico semanal de humor com tendência.

**Públicos secundários (explícitos no código)**
- **Participante de teste de usabilidade:** banner "Teste o VidaPlus! 🧪", página de missões e questionários
  que pedem só o primeiro nome (não exigem conta).
- **Equipe do projeto:** "Visão gerencial" na Home e "Painel de Resultados", ambos atrás de um código de acesso.

---

## 3. Funcionalidades principais

### 3.1 Humor

| | |
| --- | --- |
| **Onde** | Home → card "Check-in de humor" |
| **Como** | Um toque em uma de 5 opções: 😢 Péssimo · 🙁 Ruim · 😐 Ok · 🙂 Bem · 😄 Ótimo |
| **Regras** | Um registro por dia; tocar em outra opção substitui o de hoje. Mostra "Você está se sentindo X hoje" e o humor de ontem |
| **Histórico** | Saúde → linha do tempo dos últimos 7 dias, "Humor mais frequente" e selo de tendência (melhor / pior / estável) comparando a média da semana com a da semana anterior (variação menor que 0,15 conta como estável) |

### 3.2 Hidratação

| | |
| --- | --- |
| **Onde** | Home → card "Hidratação" |
| **Como** | Botões − / + (1 copo por toque), anel de progresso e barra |
| **Regras** | Meta de **8 copos**; valor limitado entre 0 e 20; só o dia de hoje é editável |
| **Histórico** | Saúde → "Hidratação média (7 dias)" |

### 3.3 Passos

| | |
| --- | --- |
| **Onde** | Home → card "Passos" |
| **Como** | Registro manual em incrementos. Dois grupos rotulados: **Adicionar passos** (+100 / +500 / +1000, em destaque) e **Corrigir passos** (−100 / −500 / −1000, discretos, abaixo de um divisor) |
| **Regras** | Meta de **6.000 passos**; valor limitado entre 0 e 50.000; só hoje é editável. O anel mostra "4.2k / 6k" |

### 3.4 Medicamentos

| | |
| --- | --- |
| **Onde** | Home → card "Medicamentos de hoje" |
| **Cadastro** | Modal com nome, dosagem (opcional), horário e frequência: **Diário** ou **Dias específicos** (seletor D S T Q Q S S) |
| **Uso diário** | Lista ordenada por horário; marcar/desmarcar como tomado; remédios fora do dia aparecem esmaecidos ("Hoje não · seg, qua") e não contam no progresso |
| **Feedback** | Contador "tomados/total" no Resumo do dia; faixa verde "Todos os medicamentos do dia foram tomados!" |
| **Histórico** | Saúde → "Dias com medicação completa" (0 a 7, nos últimos 7 dias) |

### 3.5 Agenda

| | |
| --- | --- |
| **Onde** | Aba Agenda (e o calendário "Agenda do mês" e "Lembretes de hoje" na Home) |
| **Tipos** | Consulta (azul) · Exame (roxo) · Lembrete (âmbar) · Outro (cinza) |
| **Criar / editar** | Botão de destaque **Novo compromisso** (no cabeçalho no desktop; botão flutuante com rótulo no mobile; atalho no estado vazio). Campos: título, data, horário, tipo, observações |
| **Regras** | Duração padrão de 30 min. O banco impede dois compromissos sobrepostos para a mesma pessoa e a mensagem de conflito volta para a tela. Excluir **cancela** o compromisso (some da agenda, mas fica no histórico) |
| **Integração** | Exames do prontuário aparecem na data correspondente, com link para a Saúde. A Home leva à Agenda já no dia selecionado ("Ver tudo") |

### 3.6 Prontuário / Exames

| | |
| --- | --- |
| **Onde** | Saúde → card "Prontuário / Exames" |
| **Cadastro** | Modal "Novo exame": nome, data, local, resultado e status (**Normal**, **Atenção**, **Crítico**) |
| **Importar PDF** | Opcional. O texto do laudo é lido no próprio navegador (pdf.js) e o formulário é pré-preenchido: nome (rótulos como "Exame:" ou a primeira linha), data (rótulos como "Data de coleta" ou a primeira data encontrada), local ("Laboratório:", "Clínica:"...), status por palavras-chave ("alterado" → Atenção, "crítico"/"urgente" → Crítico) e resultado (até 4.000 caracteres). O usuário confere antes de salvar |
| **Consulta** | Busca por nome, filtro por status e por data, botão "Limpar"; clique na linha expande o resultado completo |
| **Excluir** | Diálogo de confirmação: *"Tem certeza que deseja excluir o exame 'X'? Esta ação não pode ser desfeita."* |

### 3.7 Perfil

- Dados da conta (nome e e-mail) com edição, validação e cancelar.
- Preferência de **modo escuro** (também disponível na barra superior).
- **Sair da conta**, com confirmação.
- Acesso a **Testes de Usabilidade** (progresso "x/3 missões") e a **Avaliar o VidaPlus**: Pesquisa de Satisfação
  (10 perguntas), NPS (0–10 + justificativa), Escala SUS (10 afirmações) e Painel de Resultados (restrito).

### 3.8 Funcionalidades de apoio

| Funcionalidade | Descrição |
| --- | --- |
| **Cadastro e login** | Entrar / Cadastrar no mesmo card; cadastro pede nome, data de nascimento, e-mail e senha (mín. 6 caracteres) |
| **Testes (missões)** | 3 missões verificadas automaticamente pelos dados do usuário: (1) humor + 3 copos + 1.000 passos + 1 remédio; (2) 1 consulta + 1 lembrete; (3) 1 exame. Concluídas, levam às 3 pesquisas |
| **Visão gerencial** | Na Home, atrás de código: NPS, SUS (com nota), satisfação média e total de consultas |
| **Painel de Resultados** | Abas Satisfação, NPS, SUS e Resumo Geral, com médias, distribuições, respostas abertas, mediana/desvio padrão do SUS e "Principais achados" gerados a partir dos dados |
| **Sessão** | Se o token expira, a sessão é encerrada e o usuário volta ao login com aviso |

---

## 4. Arquitetura de informação

### 4.1 Mapa de telas

```
/login ─────────────── Entrar | Cadastrar
│
├─ [App autenticado — TopNav (desktop) / BottomNav (mobile)]
│   ├─ /          Home
│   │              ├─ Saudação + data
│   │              ├─ Banner "Teste o VidaPlus" (até concluir as missões)
│   │              ├─ Humor · Hidratação · Passos      │  Agenda do mês (calendário)
│   │              ├─ Resumo do dia
│   │              ├─ Medicamentos de hoje             │  Lembretes do dia
│   │              └─ Visão gerencial (restrita)
│   ├─ /saude     Saúde
│   │              ├─ Indicadores da semana (água, humor, medicação)
│   │              ├─ Histórico de humor (7 dias)
│   │              └─ Prontuário / Exames  → modal Novo exame · diálogo Excluir
│   ├─ /agenda    Agenda
│   │              ├─ Calendário + legenda
│   │              ├─ Compromissos do dia  → modal Novo/Editar compromisso
│   │              └─ Exames do prontuário do dia → /saude
│   ├─ /perfil    Perfil
│   │              ├─ Dados da conta · Modo escuro · Sair
│   │              ├─ Testes de Usabilidade → /testes
│   │              └─ Avaliar o VidaPlus → /avaliacao/*
│   └─ /testes    Missões de teste (acessada pelo banner da Home ou pelo Perfil)
│
└─ [Fluxos em tela cheia — SurveyShell, sem navegação principal]
    ├─ /avaliacao/satisfacao
    ├─ /avaliacao/nps
    ├─ /avaliacao/sus
    └─ /avaliacao/resultados (restrita)
```

Rotas desconhecidas redirecionam para `/`; usuário sem sessão é levado a `/login`; usuário logado que abre `/login` vai para `/`.

### 4.2 Navegação

- **Quatro destinos fixos** — Home, Saúde, Agenda, Perfil — com os mesmos ícones e a mesma ordem nas duas barras.
  - **Mobile:** barra inferior fixa (alcance do polegar), ícone + rótulo, ponto verde no item ativo.
  - **Desktop:** barra superior com indicador deslizante sob o item ativo; rótulos de texto a partir de 1024 px.
- **Ações globais** na barra superior: alternar tema e menu do avatar (nome, e-mail, sair).
- **Pesquisas** abrem em tela cheia com cabeçalho próprio (voltar, título, "N de M" e barra de progresso), removendo
  distrações durante a resposta.
- **Atalhos contextuais:** "Ver tudo" no calendário da Home → Agenda no mesmo dia; exame na Agenda → Saúde; banner → Testes.

### 4.3 Hierarquia

- **Home = hoje.** Tudo o que pede ação no dia: registrar humor, água, passos, tomar remédios, ver compromissos.
  Ao escolher outro dia no calendário, os cards passam a mostrar aquele dia em modo leitura ("Editável apenas para hoje").
- **Saúde = histórico.** Leitura agregada (semana) e o arquivo de exames.
- **Agenda = futuro e planejamento.** Mês inteiro, criação e edição de compromissos.
- **Perfil = conta, preferências e avaliação.**

---

## 5. Decisões de design

### 5.1 Por que essas cores

- **Verde-esmeralda como cor da marca** (`#059669`): associado a saúde, equilíbrio e "tudo certo". É também a cor de
  sucesso, então a mesma cor que identifica o produto confirma as ações concluídas (remédio tomado, missão concluída,
  exame Normal).
- **Base neutra (cinzas)** em superfícies e textos: a cor fica reservada para significado. Quando algo é colorido,
  é porque representa uma métrica, uma categoria ou um estado.
- **Uma cor por métrica**, repetida no card, no anel, na barra e no resumo: água azul, passos âmbar, humor roxo,
  remédios verde. O usuário reconhece a métrica pela cor antes de ler o rótulo.
- **Uma cor por tipo de compromisso** (Consulta azul, Exame roxo, Lembrete âmbar, Outro cinza), com legenda sempre
  visível embaixo do calendário.
- **Semáforo para estados de saúde**: Normal (verde), Atenção (âmbar), Crítico (vermelho) — leitura imediata e
  universal. O texto do status sempre acompanha a cor.
- **Tons tingidos (cor a 10%)** para badges e chips, em vez de blocos de cor sólida: informam sem gritar, mantendo a
  interface calma — importante num contexto de saúde.

### 5.2 Por que essa estrutura

- **Mobile-first:** registro de saúde acontece no celular, várias vezes ao dia. Barra inferior, faixa rolável de resumo,
  modais como *bottom sheet* e botões de pelo menos 40 px foram pensados para o toque. No desktop o mesmo conteúdo se
  reorganiza em duas a quatro colunas.
- **Cards como unidade:** cada assunto é um card com cabeçalho (ícone + rótulo) e conteúdo. Isso torna a Home escaneável
  e permite reorganizar o grid por tamanho de tela sem mudar o componente.
- **O dia como unidade de registro:** humor, água, passos e remédios são "do dia". Dias passados ficam só para leitura,
  o que protege o histórico de edições acidentais.
- **Registros de um toque:** emojis em vez de formulário para o humor; +/− em vez de digitar números. Quanto menor o
  esforço, maior a chance de o hábito se manter.
- **Calendário compartilhado:** o mesmo componente aparece na Home e na Agenda, e mistura compromissos e exames, reforçando a ideia de "tudo em um lugar".

### 5.3 Como a interface comunica o propósito

- **Slogan presente** no login ("Sua saúde, centralizada.") e na descrição da página.
- **Tom acolhedor e pessoal:** "Olá, Nome 👋" com a data por extenso; "Humor registrado. Obrigado por compartilhar!";
  "Dia livre!" quando não há compromissos; "Que bom te ver de novo".
- **Check-in de humor no topo da Home:** a primeira pergunta do dia é "como você está?", não um número.
- **Feedback imediato:** toasts para cada ação, animação do emoji escolhido, anéis que enchem, faixa verde de
  "todos os remédios tomados", check animado ao concluir missões e pesquisas.
- **Estados vazios que orientam:** ícone, título e uma frase do próximo passo ("Adicione seus remédios para acompanhar os horários certinhos."), muitas vezes com o botão da ação.
- **Proteção contra perda:** confirmação antes de sair da conta e antes de excluir um exame; compromissos excluídos são apenas cancelados no banco.

### 5.4 Decisões vindas do teste de usabilidade (MAC)

| Problema observado | Decisão |
| --- | --- |
| Os botões −1000/−500/−100 de passos confundiam (pareciam ações principais) | Separar em "Adicionar passos" (destaque) e "Corrigir passos" (discreto, abaixo de um divisor, com tooltip) |
| O botão de criar compromisso era discreto demais (só um "+") | Botão grande com texto "Novo compromisso" no cabeçalho (desktop) e botão flutuante com rótulo (mobile) |
| Excluir exame não tinha volta | Diálogo de confirmação citando o nome do exame e avisando que a ação não pode ser desfeita |

---

## 6. Fluxos principais do usuário

### 6.1 Primeiro acesso
1. `/login` → aba **Cadastrar** → nome, data de nascimento, e-mail e senha.
2. Validação local (campos obrigatórios, senha ≥ 6) e no servidor (e-mail único, nome ≥ 3).
3. Sucesso → toast "Bem-vindo(a), Nome!" → Home, com o banner de missões.

### 6.2 Check-in diário
1. Home → tocar no emoji do humor → toast de confirmação e frase "Você está se sentindo…".
2. Tocar **+** em Hidratação a cada copo.
3. Em Passos, tocar em **Adicionar passos** (ou **Corrigir passos** se errou).
4. Marcar os remédios conforme toma → contador e faixa verde ao completar.

### 6.3 Cadastrar um medicamento
1. Home → **+** em "Medicamentos de hoje" (ou "Adicionar primeiro medicamento").
2. Nome, dosagem, horário, frequência (e dias, se "Dias específicos").
3. **Adicionar** → aparece na lista na ordem do horário.

### 6.4 Agendar um compromisso
1. Agenda → escolher o dia no calendário → **Novo compromisso**.
2. Título, data, horário, tipo e observações → **Adicionar compromisso**.
3. Se houver choque de horário, a mensagem do servidor aparece e o modal continua aberto para ajuste.
4. Sucesso → calendário vai para o mês/dia do compromisso e marca a data com a cor do tipo.
5. Editar (lápis) ou excluir (lixeira) pelo próprio card do compromisso.

### 6.5 Registrar um exame
1. Saúde → **Novo Exame**.
2. (Opcional) **Importar exame de um PDF** → campos pré-preenchidos → conferir.
3. Ajustar nome, data, local, resultado e status → **Adicionar exame**.
4. O exame entra no prontuário e passa a aparecer no calendário (Home e Agenda).

### 6.6 Excluir um exame
1. Saúde → lixeira na linha do exame.
2. Diálogo: "Tem certeza que deseja excluir o exame 'X'? Esta ação não pode ser desfeita."
3. **Excluir** → toast "Exame removido." · **Cancelar** → nada muda.

### 6.7 Consultar o histórico
1. Saúde → indicadores da semana e linha do tempo do humor.
2. Prontuário → buscar, filtrar por status/data, tocar na linha para ver o resultado completo.
3. Na Home, tocar em um dia passado do calendário mostra água, passos e lembretes daquele dia.

### 6.8 Teste de usabilidade e avaliação
1. Banner da Home ou Perfil → **Testes** → seguir as 3 missões (o progresso é detectado sozinho).
2. Missões concluídas → Satisfação → NPS → SUS (cada uma pede o primeiro nome).
3. Tela de agradecimento; no SUS, o score aparece com medidor e nota.
4. Equipe: Perfil → **Ver Resultados** → código de acesso → painel.

### 6.9 Sessão
- **Sair:** avatar → Sair (ou Perfil → Sair da conta) → confirmação → login.
- **Sessão expirada:** a primeira chamada recusada pela API encerra a sessão e mostra "Sua sessão expirou. Entre novamente."

---

## 7. Tecnologias utilizadas

### Frontend

| Tecnologia | Versão (package.json) | Papel |
| --- | --- | --- |
| React | ^19.2 | Interface (componentes funcionais + hooks + Context) |
| Vite | ^8.2 | Dev server e build; páginas carregadas sob demanda com `lazy()` |
| Tailwind CSS | ^4.3 (`@tailwindcss/vite`) | Estilo utilitário; tokens no `@theme` de `index.css` |
| React Router DOM | ^7.18 | Rotas, rotas protegidas e layout aninhado |
| framer-motion | ^13.2 | Transições de página, modais, indicadores de navegação |
| lucide-react | ^1.41 | Ícones |
| @fontsource-variable/inter | ^5.3 | Fonte Inter Variable empacotada |
| pdfjs-dist | ^6.3 | Leitura de laudos em PDF no navegador (carregado só quando usado) |
| oxlint | ^1.79 | Lint |

### Backend ([`backend/`](backend/))

| Tecnologia | Papel |
| --- | --- |
| Node.js + Express 4 | API REST em `/api` (`auth`, `consultas`, `avaliacoes`, `dashboard`) |
| PostgreSQL + Prisma 6 | Banco e ORM; `EXCLUSION CONSTRAINT` impede compromissos sobrepostos |
| JWT (`jsonwebtoken`) + `bcrypt` | Autenticação e hash de senha |
| Zod | Validação das requisições, com mensagens em português |

### Onde cada dado fica

| Dado | Armazenamento |
| --- | --- |
| Conta, login | API → PostgreSQL (token JWT e usuário em cache no `localStorage`) |
| Agenda (compromissos) | API → PostgreSQL |
| Pesquisas (Satisfação, NPS, SUS) e indicadores gerenciais | API → PostgreSQL |
| Humor, hidratação, passos, medicamentos, exames, progresso das missões | `localStorage` do navegador, por e-mail do usuário |
| Tema | `localStorage` (`vidaplus_theme`) |

### Deploy

Frontend configurado para a Vercel ([`vercel.json`](vercel.json)): build `vite build`, saída `dist/` e *rewrite* de todas
as rotas para `index.html` (SPA). A URL da API vem de `VITE_API_URL`.

---

## 8. Acessibilidade

### O que foi considerado

| Área | Implementação |
| --- | --- |
| **Idioma** | `<html lang="pt-BR">`; toda a interface e as mensagens de erro (inclusive da API) em português |
| **Foco visível** | Contorno de 2 px na cor de destaque com afastamento de 2 px em `:focus-visible` de botões, links e campos |
| **Botões só com ícone** | Têm `aria-label` (fechar, mês anterior/próximo, alternar tema, menu do usuário, editar, excluir, +/− de água e passos, mostrar senha) |
| **Diálogos** | `role="dialog"`, `aria-modal` e título associado; fecham com **Esc** e travam a rolagem do fundo |
| **Estados anunciáveis** | `aria-pressed` em humor, dias da semana e remédios; `role="switch"` + `aria-checked` no modo escuro; `aria-expanded` no menu do avatar; `role="alert"` nas mensagens de erro |
| **Campos** | Rótulos visíveis nos formulários dos modais; `aria-label` nos campos de login/cadastro e `autocomplete` (nome, e-mail, senha, nascimento) |
| **Cor nunca sozinha** | Status, categorias e tendências sempre trazem texto ("Normal", "Consulta", "Melhor que a semana anterior"); humor tem emoji e rótulo |
| **Alvos de toque** | Controles principais com 40–56 px (contadores, células do calendário no desktop, botões de formulário, FAB); `safe-area-inset-bottom` na barra inferior |
| **Leitura** | Hierarquia por tamanho e peso, números com `tabular-nums`, datas por extenso |
| **Modo escuro** | Tema escuro completo, com `color-scheme` para controles nativos, aplicado antes da renderização (sem flash) |
| **Prevenção de erros** | Confirmação em ações destrutivas, validação com mensagem clara, botões desabilitados durante envios, dias passados só para leitura |

### Limitações conhecidas

Pontos identificados na análise do código que ainda não estão resolvidos:

1. **Contraste do texto secundário/legendas.** `--text-muted` fica em torno de 2,5:1 nos dois temas (mínimo AA: 4,5:1).
   Texto branco sobre o verde `#059669` fica em ~3,8:1 — suficiente só para texto grande, e os botões usam 14–15 px.
   Âmbar `#d97706` sobre branco fica em ~3,2:1.
2. **Movimento.** Não há tratamento de `prefers-reduced-motion`; animações de entrada, molas e o ponto pulsante sempre rodam.
3. **Modal sem armadilha de foco.** O foco vai para o primeiro campo (`autoFocus`), mas o Tab pode sair do diálogo e
   o foco não volta ao botão de origem ao fechar.
4. **Rótulos sem associação programática.** Nos modais, os `<label>` não usam `htmlFor`/`id`.
5. **Elementos clicáveis não nativos.** A linha da tabela de exames (expandir) e o card de exame na Agenda são `div`/`tr`
   com `onClick`, sem acesso por teclado.
6. **Ações escondidas no hover.** Editar/excluir compromissos e excluir remédios usam `opacity-0` no desktop até o
   hover. Continuam alcançáveis pelo Tab, mas ficam invisíveis mesmo com foco (o contorno também fica transparente).
7. **Upload de PDF.** O `<input type="file">` fica oculto e o `<label>` que o aciona não é focável pelo teclado.
8. **Células do calendário no mobile** têm 36 px de altura, abaixo dos 44 px recomendados para toque.
9. **Código de acesso no cliente.** A "Visão gerencial" e o "Painel de Resultados" são liberados por um código
   verificado no navegador — serve para o protótipo, não como controle de acesso real.
