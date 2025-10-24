import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "data", "codelink.db");
sqlite3.verbose();
const db = new sqlite3.Database(dbPath);


  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      team TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
db.run('CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT,name	TEXT NOT NULL,user1	INTEGER, user2 INTEGER, user3 INTEGER, user4 INTEGER, user5 INTEGER, user6 INTEGER, user7 INTEGER, user8 INTEGER, user9 INTEGER, user10	INTEGER, program BLOB, createdAt	DATETIME DEFAULT CURRENT_TIMESTAMP);');
export default db;
