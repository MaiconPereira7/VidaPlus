import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Instância única do Prisma Client compartilhada pela aplicação inteira.
// Criar um PrismaClient por requisição esgotaria o pool de conexões do
// Postgres rapidamente — este é o padrão recomendado pela própria Prisma.
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
});

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
