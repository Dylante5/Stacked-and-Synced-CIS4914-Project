import { Router } from "express";
import db from "../db.js";

const router = Router();

// creating a folder
router.post("/createfolder", (req, res) => {
    const { name, project_id, parent } = req.body || {};
    if (!name || !project_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    if (!parent) {
        parent = -1
    }
    const stmt = db.prepare(
        `INSERT INTO folders (name, project_id, parent) VALUES (?, ?, ?)`
    );
    stmt.run(name, project_id, parent, function (err) {
        if (err) {
            return res.status(500).json({ error: "DB error" });
        }
        db.get(`SELECT * FROM folders WHERE id = ?`, [this.lastID], (err2, row) => {
            if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
            return res.status(201).json({ project: row });
        });
    });
});

// creating a file
router.post("/createfile", (req, res) => {
    const { name, project_id, parent } = req.body || {};
    if (!name || !project_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    if (!parent) {
        parent = -1
    }
    const stmt = db.prepare(
        `INSERT INTO files (name, project_id, parent, content) VALUES (?, ?, ?, "")`
    )
    stmt.run(name, project_id, parent, function (err) {
        if (err) {
            return res.status(500).json({ error: "DB error" });
        }
        db.get(`SELECT * FROM files WHERE id = ?`, [this.lastID], (err2, row) => {
            if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
            return res.status(201).json({ project: row });
        });
    });
});

// getting all files for a given project_id
router.get("/getfiles", (req, res) => {
    const { project_id } = req.params;
    if (!project_id) return res.status(400).json({ error: "Missing project_id" });

    db.all(
        `SELECT *
     FROM files 
     WHERE project_id = ?`,
        [project_id],
        (err, rows) => {
            if (err) {
                console.error("DB query error:", err);
                return res.status(500).json({ error: "Database query error" });
            }
            res.status(200).json({ projects: rows });
        }
    );
});

// getting all folders for a given project_id
router.get("/getfolders", (req, res) => {
    const { project_id } = req.params;
    if (!project_id) return res.status(400).json({ error: "Missing project_id" });

    db.all(
        `SELECT *
     FROM folders 
     WHERE project_id = ?` ,
        [proejct_id],
        (err, rows) => {
            if (err) {
                console.error("DB query error:", err);
                return res.status(500).json({ error: "Database query error" });
            }
            res.status(200).json({ projects: rows });
        }
    );
});

router.get("/getchildren/:parent", (req, res) => {
    const { parent } = req.params;
    if(!parent) return res.status(400).json({ error: "Missing parent" });

    db.all(
        `SELECT *
     FROM folders 
     WHERE parent = ?;
     SELECT *
     FROM files
     WHERE parent = ?` ,
        [parent, parent],
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