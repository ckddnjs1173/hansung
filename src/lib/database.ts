import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const databasePath = path.join(process.cwd(), "data", "local", "hansung.sqlite");
const schemaFiles = [
  path.join(process.cwd(), "database", "schema.sql"),
  path.join(process.cwd(), "database", "phase2.sql"),
  path.join(process.cwd(), "database", "phase3.sql"),
  path.join(process.cwd(), "database", "phase4.sql"),
  path.join(process.cwd(), "database", "phase5.sql"),
  path.join(process.cwd(), "database", "phase7.sql"),
];

function ensureDatabaseDirectory() { fs.mkdirSync(path.dirname(databasePath), { recursive: true }); }
function applySchema(database: DatabaseSync) { for (const schemaPath of schemaFiles) if (fs.existsSync(schemaPath)) database.exec(fs.readFileSync(schemaPath, "utf8")); }
export function hasLocalDatabase() { return fs.existsSync(databasePath); }
export function withDatabase<T>(work: (database: DatabaseSync) => T): T { ensureDatabaseDirectory(); const database = new DatabaseSync(databasePath); try { applySchema(database); return work(database); } finally { database.close(); } }
