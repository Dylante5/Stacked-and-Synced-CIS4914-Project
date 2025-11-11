import { Router } from "express";
import db from "../db.js";

const router = Router();

// register
router.post("/create", (req, res) => {
    const {name, teamId} = req.body || {};
    if (!name || !teamId) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const stmt = db.prepare(
        `INSERT INTO projects (name, team_id, program) VALUES (?, ?, "")`
    );
    stmt.run(name, teamId, function (err) {
        if (err) {
            return res.status(500).json({ error: "DB error" });
        }
        db.get(`SELECT * FROM projects WHERE id = ?`, [this.lastID], (err2, row) => {
            if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
            return res.status(201).json({ user: row });
        });
    });
});

// getting user projects PER TEAM
router.get("/by-team/:teamId", (req, res) => {
  const { teamId } = req.params;
  if (!teamId) return res.status(400).json({ error: "Missing teamId" });

  db.all(
    `SELECT * FROM projects WHERE team_id = ? ORDER BY createdAt DESC`,
    [teamId],
    (err, rows) => {
      if (err) {
        console.error("DB query error:", err);
        return res.status(500).json({ error: "Database query error" });
      }
      res.status(200).json({ projects: rows });
    }
  );
});

// getting user projects PER user
router.get("/mine/:userId", (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  db.all(
    `SELECT *
     FROM projects 
     JOIN team_members ON team_id = projects.team_id
     WHERE team_members.user_id = ?
     ORDER BY projects.createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("DB query error:", err);
        return res.status(500).json({ error: "Database query error" });
      }
      res.status(200).json({ projects: rows });
    }
  );
});

export default router;
