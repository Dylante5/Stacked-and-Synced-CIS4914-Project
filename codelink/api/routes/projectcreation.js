import { Router } from "express";
import db from "../db.js";

const router = Router();

// register
router.post("/create", (req, res) => {
    const {name, userid} = req.body || {};
    if (!name || !userid) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const stmt = db.prepare(
        `INSERT INTO projects (name, user1, program) VALUES (?, ?, "")`
    );
    stmt.run(name, userid, function (err) {
        if (err) {
            return res.status(500).json({ error: "DB error" });
        }
        db.get(`SELECT * FROM projects WHERE id = ?`, [this.lastID], (err2, row) => {
            if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
            return res.status(201).json({ user: row });
        });
    });
});

// getting user projects
router.get("/gather", (req, res) => {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Missing id" });
    db.get(`SELECT id FROM projects WHERE user1 = ? OR user2 = ? OR user3 = ? OR user4 = ? OR user5 = ? OR user6 = ? OR user7 = ? OR user8 = ? OR user9 = ? OR user10 = ?`, [id, id, id, id, id, id, id, id, id, id], (err, row) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.send({ user: safe });
    });
});

export default router;
