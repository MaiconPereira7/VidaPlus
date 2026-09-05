-- Impede que a MESMA pessoa tenha dois compromissos de tempo bloqueado
-- (Consulta/Exame) com horários sobrepostos, garantido pelo próprio
-- Postgres (não pela aplicação). Lembrete/Outro ficam de fora de
-- propósito: podem coexistir com qualquer coisa no mesmo horário.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "consultas"
  ADD CONSTRAINT sem_conflito_horario_pessoal
  EXCLUDE USING gist (
    usuario_id WITH =,
    tsrange(data_hora_inicio, data_hora_fim) WITH &&
  )
  WHERE (status <> 'CANCELADA' AND tipo IN ('CONSULTA', 'EXAME'));
