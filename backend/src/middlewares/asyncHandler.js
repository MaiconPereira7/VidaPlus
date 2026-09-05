// Envolve um controller async para que qualquer erro (throw ou Promise
// rejeitada) caia automaticamente no errorHandler central via next(err).
// Sem isso, todo controller precisaria de try/catch repetido — e um
// esquecimento derruba o processo com uma unhandled rejection.
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
