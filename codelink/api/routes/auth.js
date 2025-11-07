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
  const { username, password, firstName, lastName, team } = req.body || {};
  if (!username || !password || !firstName || !lastName || !team) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const stmt = db.prepare(
    `INSERT INTO users (username, password, firstName, lastName, team) VALUES (?, ?, ?, ?, ?)`
  );
  stmt.run(username, CryptoJS.AES.encrypt(password, "idk").toString(), firstName, lastName, team, function (err) {
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
      if (!row || Buffer.from(CryptoJS.AES.decrypt(row.password, "idk").toString(), 'hex').toString() !== password) return res.status(401).json({ error: "Invalid credentials"});
    const { password: _, ...safe } = row;
    res.send({ user: safe });
  });
});

export default router;
