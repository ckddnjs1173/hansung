import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const databasePath = path.join(process.cwd(), "data", "local", "hansung.sqlite");
const schemaPath = path.join(process.cwd(), "database", "schema.sql");

function ensureDatabaseDirectory() {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

function applySchema(database: DatabaseSync) {
  if (!fs.existsSync(schemaPath)) return;
  database.exec(fs.readFileSync(schemaPath, "utf8"));
}

export function hasLocalDatabase() {
  return fs.existsSync(databasePath);
}

export function withDatabase<T>(work: (database: DatabaseSync) => T): T {
  ensureDatabaseDirectory();
  const database = new DatabaseSync(databasePath);
  try {
    applySchema(database);
    return work(database);
  } finally {
    database.close();
  }
}
