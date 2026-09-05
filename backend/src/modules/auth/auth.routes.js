import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { registrarSchema, loginSchema, atualizarPerfilSchema } from "./auth.validators.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/registrar", validate(registrarSchema), asyncHandler(authController.registrar));
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.patch(
  "/me",
  authenticate,
  validate(atualizarPerfilSchema),
  asyncHandler(authController.atualizarMe)
);
