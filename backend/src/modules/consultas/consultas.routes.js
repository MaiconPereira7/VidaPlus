import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  criarConsultaSchema,
  atualizarConsultaSchema,
  listarConsultasSchema,
  idParamSchema,
} from "./consultas.validators.js";
import * as consultasController from "./consultas.controller.js";

export const consultasRouter = Router();

consultasRouter.use(authenticate);

consultasRouter.post("/", validate(criarConsultaSchema), asyncHandler(consultasController.criar));
consultasRouter.get("/", validate(listarConsultasSchema), asyncHandler(consultasController.listar));
consultasRouter.get("/:id", validate(idParamSchema), asyncHandler(consultasController.buscar));
consultasRouter.patch(
  "/:id",
  validate({ ...idParamSchema, ...atualizarConsultaSchema }),
  asyncHandler(consultasController.atualizar)
);
consultasRouter.patch(
  "/:id/cancelar",
  validate(idParamSchema),
  asyncHandler(consultasController.cancelar)
);
consultasRouter.delete("/:id", validate(idParamSchema), asyncHandler(consultasController.remover));
