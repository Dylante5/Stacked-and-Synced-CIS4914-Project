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
  const { name, description = "", userId } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const stmt = db.prepare(`INSERT INTO teams (name, description) VALUES (?, ?)`);
  stmt.run(name, description, function (err) {
    if (err) {
      if (String(err).includes("UNIQUE")) {
        return res.status(409).json({ error: "Team name already exists" });
      }
      return res.status(500).json({ error: String(err) });
    }
	
	const teamId = this.lastID;
	
	const memberStmt = db.prepare(
	  `INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'Owner')`
	);
	
	memberStmt.run(teamId, userId, (err2) => {
      if (err2) {
        console.error("Error adding owner:", err2);
        return res.status(500).json({ error: "Failed to assign owner" });
     }
	
    db.get(`SELECT id, name, description, createdAt FROM teams WHERE id = ?`, [this.lastID], (err2, row) => {
      if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
      res.status(201).json({ team: row });
		});
	   }
	 );
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
 * GET /api/teams/:teamId/members
 */
router.get("/:teamId/members", (req, res) => {
  const teamId = Number(req.params.teamId);
  if (!teamId) return res.status(400).json({ error: "teamId required" });

  db.all(
    `SELECT u.id, u.username, u.firstname, u.lastname, m.role, m.joinedAt
     FROM team_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.team_id = ?
     ORDER BY u.username ASC`,
    [teamId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ members: rows });
    }
  );
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

/**
 * DELETE /api/teams/:teamId
 */
 const deleteTeamHandler = (req, res) => {
  const teamId = Number(req.params.teamId);
  const userId = Number(req.body?.userId ?? req.query?.userId);
  if (!teamId || !userId) return res.status(400).json({ error: "teamId and userId required" });

  db.get(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!row) return res.status(403).json({ error: "Not a member of this team" });
      if (String(row.role).toLowerCase() !== "owner") {
        return res.status(403).json({ error: "Only Owner can delete this team" });
      }

      db.run(`DELETE FROM teams WHERE id = ?`, [teamId], function (err2) {
        if (err2) return res.status(500).json({ error: "DB error" });
        if (this.changes === 0) return res.status(404).json({ error: "Team not found" });
        res.json({ ok: true });
      });
    }
  );
};
 
router.delete("/:teamId(\\d+)", deleteTeamHandler);
router.delete("/:teamId(\\d+)/", deleteTeamHandler);

export default router;