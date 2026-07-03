/* eslint-disable no-undef */
// Runs a SQL migration file through the app's own DB connection.
// Usage: NODE_ENV=local node migrations/run-migration.js migrations/2026-07-02-herd-module.sql
import fs from "fs";
import sequelize from "../src/config/db.js";

const file = process.argv[2];
if (!file) {
    console.error("Usage: node migrations/run-migration.js <sql-file>");
    process.exit(1);
}

const sql = fs.readFileSync(file, "utf8");
// Split on semicolons at end of statements; ALTER TYPE ... ADD VALUE cannot run
// inside a transaction block, so run each statement separately, non-transactionally.
const statements = sql
    .split(/;\s*\n/)
    .map((s) => s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim())
    .filter(Boolean);

for (const statement of statements) {
    try {
        await sequelize.query(statement);
        console.log("OK:", statement.split("\n")[0].slice(0, 90));
    } catch (error) {
        console.error("FAILED:", statement.split("\n")[0].slice(0, 90));
        console.error("  →", error.message);
    }
}
await sequelize.close();
console.log("Migration run complete.");
