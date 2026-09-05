import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  criarSatisfacaoSchema,
  criarNpsSchema,
  criarSusSchema,
  tipoParamSchema,
} from "./avaliacoes.validators.js";
import * as avaliacoesController from "./avaliacoes.controller.js";

export const avaliacoesRouter = Router();

avaliacoesRouter.use(authenticate);

avaliacoesRouter.post(
  "/satisfacao",
  validate(criarSatisfacaoSchema),
  asyncHandler(avaliacoesController.criarSatisfacao)
);
avaliacoesRouter.post("/nps", validate(criarNpsSchema), asyncHandler(avaliacoesController.criarNps));
avaliacoesRouter.post("/sus", validate(criarSusSchema), asyncHandler(avaliacoesController.criarSus));
avaliacoesRouter.get(
  "/:tipo",
  validate(tipoParamSchema),
  asyncHandler(avaliacoesController.listarPorTipo)
);
