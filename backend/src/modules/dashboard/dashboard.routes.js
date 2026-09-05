import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { authenticate } from "../../middlewares/authenticate.js";
import * as dashboardService from "./dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/resumo",
  authenticate,
  asyncHandler(async (req, res) => {
    const dados = await dashboardService.resumoGeral(req.usuarioId);
    res.json(dados);
  })
);
