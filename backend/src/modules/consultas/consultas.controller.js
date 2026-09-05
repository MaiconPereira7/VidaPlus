import * as consultasService from "./consultas.service.js";

export async function criar(req, res) {
  const consulta = await consultasService.criar(req.usuarioId, req.body);
  res.status(201).json(consulta);
}

export async function listar(req, res) {
  const consultas = await consultasService.listar(req.usuarioId, req.query);
  res.json(consultas);
}

export async function buscar(req, res) {
  const consulta = await consultasService.buscarPorId(req.params.id, req.usuarioId);
  res.json(consulta);
}

export async function atualizar(req, res) {
  const consulta = await consultasService.atualizar(req.params.id, req.usuarioId, req.body);
  res.json(consulta);
}

export async function cancelar(req, res) {
  const consulta = await consultasService.cancelar(req.params.id, req.usuarioId);
  res.json(consulta);
}

export async function remover(req, res) {
  await consultasService.remover(req.params.id, req.usuarioId);
  res.status(204).send();
}
