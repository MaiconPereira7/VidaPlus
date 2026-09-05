import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { consultasRouter } from "./modules/consultas/consultas.routes.js";
import { avaliacoesRouter } from "./modules/avaliacoes/avaliacoes.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// Health check — útil para confirmar que a API subiu antes de ligar o
// frontend nela, e para serviços de deploy (Render/Railway) verificarem
// se o container está de pé.
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/consultas", consultasRouter);
app.use("/api/avaliacoes", avaliacoesRouter);
app.use("/api/dashboard", dashboardRouter);

// Rota não encontrada — precisa vir depois de todas as rotas reais.
app.use((req, res) => {
  res.status(404).json({ error: { message: "Rota não encontrada." } });
});

// Error handler central — precisa ser o ÚLTIMO middleware registrado.
app.use(errorHandler);
