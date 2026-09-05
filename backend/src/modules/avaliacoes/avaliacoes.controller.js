import * as avaliacoesService from "./avaliacoes.service.js";

export async function criarSatisfacao(req, res) {
  const avaliacao = await avaliacoesService.criarSatisfacao(req.body, req.usuarioId);
  res.status(201).json(avaliacao);
}

export async function criarNps(req, res) {
  const avaliacao = await avaliacoesService.criarNps(req.body, req.usuarioId);
  res.status(201).json(avaliacao);
}

export async function criarSus(req, res) {
  const avaliacao = await avaliacoesService.criarSus(req.body, req.usuarioId);
  res.status(201).json(avaliacao);
}

export async function listarPorTipo(req, res) {
  const avaliacoes = await avaliacoesService.listarPorTipo(req.params.tipo);
  res.json(avaliacoes);
}
