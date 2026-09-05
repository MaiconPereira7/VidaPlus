import * as authService from "./auth.service.js";

export async function registrar(req, res) {
  const resultado = await authService.registrar(req.body);
  res.status(201).json(resultado);
}

export async function login(req, res) {
  const resultado = await authService.autenticar(req.body);
  res.status(200).json(resultado);
}

export async function me(req, res) {
  const usuario = await authService.buscarPerfil(req.usuarioId);
  res.json(usuario);
}

export async function atualizarMe(req, res) {
  const usuario = await authService.atualizarPerfil(req.usuarioId, req.body);
  res.json(usuario);
}
