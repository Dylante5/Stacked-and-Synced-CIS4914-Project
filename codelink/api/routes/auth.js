import { Router } from "express";
import CryptoJS from 'crypto-js';
import db from "../db.js";

const router = Router();

const strip = (u) => {
  const { password, ...safe } = u;
  return safe;
};

// register
router.post("/register", (req, res) => {
  const { username, password, firstName, lastName } = req.body || {};
  if (!username || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const stmt = db.prepare(
    `INSERT INTO users (username, password, firstName, lastName) VALUES (?, ?, ?, ?)`
  );
  stmt.run(username, CryptoJS.AES.encrypt(password, "idk").toString(), firstName, lastName, function (err) {
    if (err) {
      if (String(err).includes("UNIQUE")) {
        return res.status(409).json({ error: "Username already taken" });
      }
      return res.status(500).json({ error: "DB error" });
    }
    db.get(`SELECT * FROM users WHERE id = ?`, [this.lastID], (err2, row) => {
      if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
      return res.status(201).json({ user: strip(row) });
    });
  });
});

// login
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing username or password" });

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row || Buffer.from(CryptoJS.AES.decrypt(row.password, "idk").toString(), 'hex').toString() !== password) return res.status(401).json({ error: "Invalid credentials" });

    // get user's teams
    const teams = [];
    db.all(`SELECT teams.id, teams.name, role FROM team_members JOIN teams ON team_members.team_id = teams.id WHERE user_id = ?`, [row.id], (err2, teamRows) => {
      if (err2) return res.status(500).json({ error: "DB error" });

      teamRows.forEach(function (teamRow) {
        teams.push({ id: teamRow.id, name: teamRow.name, role: teamRow.role });
      });
      const { password: _, ...safe } = row;
      res.send({ user: { ...safe, teams: teams } });
    });
  });
});

export default router;
