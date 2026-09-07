import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const databasePath = path.join(process.cwd(), "data", "local", "hansung.sqlite");
export function hasLocalDatabase() { return fs.existsSync(databasePath); }
export function withDatabase<T>(work: (database: DatabaseSync) => T): T | null {
  if (!hasLocalDatabase()) return null;
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try { return work(database); } finally { database.close(); }
}
