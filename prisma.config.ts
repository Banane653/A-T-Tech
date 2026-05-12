import { defineConfig, env } from "prisma/config";
import "dotenv/config"; // Très important pour lire ton fichier .env

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // La CLI a besoin du lien direct (Port 5432) pour créer les tables
    url: env("DIRECT_URL"),
  },
});