import { app } from "./app.js";
import { env } from "./config/env.js";
import { disconnectDatabase } from "./config/database.js";

const server = app.listen(env.PORT, () => {
  console.log(`VidaPlus API rodando em http://localhost:${env.PORT}`);
});

// Encerramento gracioso: ao receber um sinal de término (Ctrl+C local, ou
// o sinal que o Docker/Render mandam antes de matar o container), paramos
// de aceitar novas conexões e fechamos o pool do Postgres antes de sair.
// Sem isso, conexões podem ficar penduradas ou o processo sai antes do
// Prisma terminar de escrever no banco.
async function shutdown(signal) {
  console.log(`\n${signal} recebido — encerrando...`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
