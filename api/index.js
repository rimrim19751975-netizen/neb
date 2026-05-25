import { createApp } from "../server/sqliteApp.mjs";
import { createTursoApp } from "../server/tursoApp.mjs";

const hasTurso = Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

export default hasTurso ? createTursoApp() : createApp();
