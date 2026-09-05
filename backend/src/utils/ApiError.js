// Erro de domínio, previsível, que carrega o status HTTP junto com a
// mensagem. Controllers e services lançam ApiError quando a causa é uma
// regra de negócio (não encontrado, conflito, dado inválido) — o
// errorHandler central sabe transformar isso na resposta HTTP certa.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Não autenticado.") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Sem permissão para esta ação.") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso não encontrado.") {
    return new ApiError(404, message);
  }

  static conflict(message, details) {
    return new ApiError(409, message, details);
  }
}
