import { Router } from "express";
import db from "../db.js";

const router = Router();


/**
 * GET /api/teams?search=foo
 */
router.get("/", (req, res) => {
  const q = (req.query.search || "").trim();
  if (!q) {
    db.all(`SELECT id, name, description, createdAt FROM teams ORDER BY name ASC LIMIT 100`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ teams: rows });
    });
  } else {
    db.all(
      `SELECT id, name, description, createdAt
       FROM teams
       WHERE name LIKE ?
       ORDER BY name ASC LIMIT 100`,
      [`%${q}%`],
      (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ teams: rows });
      }
    );
  }
});

/**
* POST /api/teams
*/
router.post("/", (req, res) => {
  const { name, description = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required" });

  const stmt = db.prepare(`INSERT INTO teams (name, description) VALUES (?, ?)`);
  stmt.run(name, description, function (err) {
    if (err) {
      if (String(err).includes("UNIQUE")) {
        return res.status(409).json({ error: "Team name already exists" });
      }
      return res.status(500).json({ error: "DB error" });
    }
    db.get(`SELECT id, name, description, createdAt FROM teams WHERE id = ?`, [this.lastID], (err2, row) => {
      if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
      res.status(201).json({ team: row });
    });
  });
});

/**
 * POST /api/teams/:teamId/join
 */
 router.post("/:teamId/join", (req, res) => {
  const teamId = Number(req.params.teamId);
  const { userId } = req.body || {};
  if (!teamId || !userId) return res.status(400).json({ error: "teamId and userId required" });

  const stmt = db.prepare(`INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'member')`);
  stmt.run(teamId, userId, function (err) {
    if (err) {
      if (String(err).includes("UNIQUE")) {
        return res.status(409).json({ error: "User already in team" });
      }
      return res.status(500).json({ error: "DB error" });
    }
    res.status(201).json({ ok: true });
  });
});

/**
 * GET /api/teams/mine?userId=###
 */
router.get("/mine", (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ error: "userId required" });

  db.all(
    `SELECT t.id, t.name, t.description, t.createdAt, m.role, m.joinedAt
     FROM teams t
     JOIN team_members m ON m.team_id = t.id
     WHERE m.user_id = ?
     ORDER BY t.name ASC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ teams: rows });
    }
  );
});

export default router;