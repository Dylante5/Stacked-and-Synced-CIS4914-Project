import db from "./db.js";

db.serialize(() => {
  db.run("PRAGMA foreign_keys=OFF");
  db.run("BEGIN TRANSACTION");
  db.run(`
    CREATE TABLE IF NOT EXISTS users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName  TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    INSERT INTO users_new (id, username, password, firstName, lastName, createdAt)
    SELECT id, username, password, firstName, lastName, createdAt FROM users
  `);
  db.run(`DROP TABLE users`);
  db.run(`ALTER TABLE users_new RENAME TO users`);
  db.run("COMMIT");
  db.run("PRAGMA foreign_keys=ON");
});
