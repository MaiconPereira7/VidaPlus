import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// Extrai e valida o JWT do header "Authorization: Bearer <token>".
// Em caso de sucesso, anexa req.usuarioId — os controllers usam isso pra
// saber "quem está pedindo" sem precisar decodificar nada.
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Token não informado."));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.usuarioId = payload.sub;
    next();
  } catch {
    next(ApiError.unauthorized("Token inválido ou expirado."));
  }
}
