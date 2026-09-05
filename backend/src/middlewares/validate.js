// Valida body/query/params contra um schema Zod e substitui os valores
// originais pelos já parseados (o que aplica defaults e coerções, ex:
// query strings viram number/boolean quando o schema usa z.coerce).
// Erros de validação viram ZodError, capturados pelo asyncHandler e
// traduzidos pelo errorHandler central em uma resposta 400 consistente.
export function validate(schema) {
  return function (req, res, next) {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
}
