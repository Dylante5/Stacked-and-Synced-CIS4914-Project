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
  
  db.run(`
    CREATE TABLE IF NOT EXISTS projects_new (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL,
      team_id   INTEGER NOT NULL,
      program   BLOB,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    INSERT INTO projects_new (id, name, team_id, program, createdAt)
    SELECT id, name, 1 as team_id, program, createdAt
    FROM projects
  `);

  db.run(`DROP TABLE projects`);
  db.run(`ALTER TABLE projects_new RENAME TO projects`);
  
  db.run("COMMIT");
  db.run("PRAGMA foreign_keys=ON");
});
