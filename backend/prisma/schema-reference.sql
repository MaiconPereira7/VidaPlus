-- VidaPlus — Referência SQL (equivalente ao schema.prisma)
--
-- Este arquivo NÃO é executado automaticamente. Ele existe para:
--   1) Documentação / apresentação (mostrar o DDL puro para a banca).
--   2) Conter a EXCLUSION CONSTRAINT anti-conflito de horário, que o
--      Prisma não sabe gerar sozinho e precisa ser adicionada via SQL
--      manual dentro de uma migration (prisma/migrations/.../migration.sql).
--
-- O fluxo real de criação do banco é: `npx prisma migrate dev`, que gera
-- o SQL a partir do schema.prisma. Depois disso, colamos o bloco da seção
-- "4) Anti-conflito de horário" numa migration própria.

-- 1) Tipos enumerados -------------------------------------------------------

CREATE TYPE "StatusConsulta" AS ENUM ('AGENDADA', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA', 'FALTOU');
CREATE TYPE "TipoConsulta" AS ENUM ('CONSULTA', 'EXAME', 'LEMBRETE', 'OUTRO');
CREATE TYPE "TipoAvaliacao" AS ENUM ('SATISFACAO', 'NPS', 'SUS');

-- 2) Usuário — único tipo de conta -------------------------------------------
--
-- Este app é de uso pessoal (não é uma plataforma clínica com médicos
-- atendendo pacientes), então existe só um tipo de usuário — sem
-- necessidade de herança/tabelas separadas por papel.

CREATE TABLE usuarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  senha_hash      TEXT NOT NULL,
  cpf             TEXT NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  telefone        TEXT,
  endereco        TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Consultas (agenda pessoal) -----------------------------------------------

CREATE TABLE consultas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo            TEXT NOT NULL,
  data_hora_inicio  TIMESTAMPTZ NOT NULL,
  data_hora_fim     TIMESTAMPTZ NOT NULL,
  tipo              "TipoConsulta" NOT NULL DEFAULT 'CONSULTA',
  status            "StatusConsulta" NOT NULL DEFAULT 'AGENDADA',
  observacoes       TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fim_apos_inicio CHECK (data_hora_fim > data_hora_inicio)
);

CREATE INDEX idx_consultas_usuario_horario ON consultas (usuario_id, data_hora_inicio);

-- Avaliações de UX -------------------------------------------------------------

CREATE TABLE avaliacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             "TipoAvaliacao" NOT NULL,
  respondente_nome TEXT NOT NULL,
  usuario_id       UUID REFERENCES usuarios(id),
  respostas        JSONB NOT NULL,
  score            NUMERIC(5, 2),
  categoria        TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_avaliacoes_tipo ON avaliacoes (tipo);

-- 4) Anti-conflito de horário (o detalhe que impressiona a banca) -----------
--
-- Problema: a mesma pessoa tentando marcar dois compromissos de tempo
-- bloqueado (Consulta/Exame) em horários sobrepostos — fisicamente
-- impossível, mas nada no formulário impede isso sozinho. Checar só na
-- aplicação (SELECT antes de INSERT) tem uma race condition clássica:
-- duas abas/requisições simultâneas podem passar pela checagem ao mesmo
-- tempo, antes de qualquer uma ter inserido sua linha.
--
-- Solução correta: uma EXCLUSION CONSTRAINT usando GiST, que faz o Postgres
-- rejeitar o INSERT/UPDATE atomicamente se o intervalo de tempo colidir
-- com outro já existente da MESMA pessoa. Isso é aplicado pelo banco, não
-- pelo Node — não tem como escapar dela nem com bug na API.
--
-- Só vale para Consulta/Exame (tipos de "tempo bloqueado"). Lembrete/Outro
-- ficam de fora de propósito: um lembrete pode perfeitamente coexistir com
-- uma consulta no mesmo horário (ex.: "tomar remédio" durante a consulta).

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE consultas
  ADD CONSTRAINT sem_conflito_horario_pessoal
  EXCLUDE USING gist (
    usuario_id WITH =,
    tsrange(data_hora_inicio, data_hora_fim) WITH &&
  )
  WHERE (status <> 'CANCELADA' AND tipo IN ('CONSULTA', 'EXAME'));

-- Teste manual (deve falhar com "conflicting key value" na segunda linha):
--
-- INSERT INTO consultas (usuario_id, titulo, data_hora_inicio, data_hora_fim, tipo)
--   VALUES ('<usuario-1>', 'Consulta A', '2026-10-01 14:00', '2026-10-01 14:30', 'CONSULTA');
-- INSERT INTO consultas (usuario_id, titulo, data_hora_inicio, data_hora_fim, tipo)
--   VALUES ('<usuario-1>', 'Consulta B', '2026-10-01 14:15', '2026-10-01 14:45', 'CONSULTA');
--   -- ERROR: conflicting key value violates exclusion constraint
