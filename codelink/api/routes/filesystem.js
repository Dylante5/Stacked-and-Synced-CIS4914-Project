import { Router } from "express";
import db from "../db.js";

const router = Router();

// creating a folder
router.post("/createfolder", (req, res) => {
	let { name, project_id, parent } = req.body || {};
	if (!name || !project_id) {
		return res.status(400).json({ error: "Missing required fields" });
	}
	if (parent == null) parent = -1;

	const stmt = db.prepare(
		`INSERT INTO folders (name, project_id, parent) VALUES (?, ?, ?)`
	);

	stmt.run(name, project_id, parent, function (err) {
		if (err) {
			console.error("createfolder DB error:", err.message);
			return res.status(500).json({ error: err.message });
		}
		db.get(
			`SELECT * FROM folders WHERE id = ?`,
			[this.lastID],
			(err2, row) => {
				if (err2 || !row) {
					console.error("createfolder fetch error:", err2?.message);
					return res.status(500).json({ error: "DB fetch error" });
				}
				return res.status(201).json(row);
			}
		);
	});
});

// creating a file
router.post("/createfile", (req, res) => {
	let { name, project_id, parent } = req.body || {};
	if (!name || !project_id) {
		return res.status(400).json({ error: "Missing required fields" });
	}
	if (parent == null) parent = -1;

	const stmt = db.prepare(
		`INSERT INTO files (name, project_id, parent, content) VALUES (?, ?, ?, "")`
	);

	stmt.run(name, project_id, parent, function (err) {
		if (err) {
			console.error("createfile DB error:", err.message);
			return res.status(500).json({ error: err.message });
		}
		db.get(
			`SELECT * FROM files WHERE id = ?`,
			[this.lastID],
			(err2, row) => {
				if (err2 || !row) {
					console.error("createfile fetch error:", err2?.message);
					return res.status(500).json({ error: "DB fetch error" });
				}
				return res.status(201).json(row);
			}
		);
	});
});

// rename a folder
router.patch("/renamefolder/:id", (req, res) => {
	const { id } = req.params;
	const { name } = req.body || {};
	if (!name) {
		return res.status(400).json({ error: "Missing name" });
	}

	const stmt = db.prepare(`UPDATE folders SET name = ? WHERE id = ?`);
	stmt.run(name, id, function (err) {
		if (err) {
			console.error("renamefolder DB error:", err.message);
			return res.status(500).json({ error: err.message });
		}
		if (this.changes === 0) {
			return res.status(404).json({ error: "Folder not found" });
		}
		db.get(`SELECT * FROM folders WHERE id = ?`, [id], (err2, row) => {
			if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
			res.status(200).json(row);
		});
	});
});

// rename a file
router.patch("/renamefile/:id", (req, res) => {
	const { id } = req.params;
	const { name } = req.body || {};
	if (!name) {
		return res.status(400).json({ error: "Missing name" });
	}

	const stmt = db.prepare(`UPDATE files SET name = ? WHERE id = ?`);
	stmt.run(name, id, function (err) {
		if (err) {
			console.error("renamefile DB error:", err.message);
			return res.status(500).json({ error: err.message });
		}
		if (this.changes === 0) {
			return res.status(404).json({ error: "File not found" });
		}
		db.get(`SELECT * FROM files WHERE id = ?`, [id], (err2, row) => {
			if (err2 || !row) return res.status(500).json({ error: "DB fetch error" });
			res.status(200).json(row);
		});
	});
});

// delete a file 
router.delete("/deletefile/:id", (req, res) => {
	const { id } = req.params;

	const stmt = db.prepare(`DELETE FROM files WHERE id = ?`);
	stmt.run(id, function (err) {
		if (err) {
			console.error("deletefile DB error:", err.message);
			return res.status(500).json({ error: err.message });
		}
		if (this.changes === 0) {
			return res.status(404).json({ error: "File not found" });
		}
		res.status(204).end();
	});
});

// delete a folder 
router.delete("/deletefolder/:id", (req, res) => {
	const { id } = req.params;

	db.serialize(() => {
		db.run(`DELETE FROM files WHERE parent = ?`, [id], function (err) {
			if (err) {
				console.error("deletefolder files error:", err.message);
				return res.status(500).json({ error: err.message });
			}

			db.run(`DELETE FROM folders WHERE parent = ?`, [id], function (err2) {
				if (err2) {
					console.error("deletefolder children error:", err2.message);
					return res.status(500).json({ error: err2.message });
				}

				db.run(`DELETE FROM folders WHERE id = ?`, [id], function (err3) {
					if (err3) {
						console.error("deletefolder DB error:", err3.message);
						return res.status(500).json({ error: err3.message });
					}
							if (this.changes === 0) {
								return res.status(404).json({ error: "Folder not found" });
							}
							res.status(204).end();
				});
			});
		});
	});
});

// getting all files for a given project_id
router.get("/getfiles/:project_id", (req, res) => {
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
router.get("/getfolders/:project_id", (req, res) => {
    const { project_id } = req.params;
    if (!project_id) return res.status(400).json({ error: "Missing project_id" });

    db.all(
        `SELECT *
     FROM folders 
     WHERE project_id = ?` ,
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

// get a single files content
router.get("/file/:id", (req, res) => {
	const { id } = req.params;

	db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
		if (err) {
		console.error("get file DB error:", err.message);
		return res.status(500).json({ error: err.message });
		}
		if (!row) {
			return res.status(404).json({ error: "File not found" });
		}
		res.status(200).json(row);
	});
});

// update a files content
router.patch("/file/:id", (req, res) => {
	const { id } = req.params;
	const { content, name } = req.body || {};

	if (content === undefined && name === undefined) {
		return res.status(400).json({ error: "Nothing to update" });
	}

	const fields = [];
	const params = [];

	if (name !== undefined) {
		fields.push("name = ?");
		params.push(name);
	}
	if (content !== undefined) {
		fields.push("content = ?");
		params.push(content);
	}
	params.push(id);

	const stmt = db.prepare(`UPDATE files SET ${fields.join(", ")} WHERE id = ?`);

	stmt.run(params, function (err) {
		if (err) {
			console.error("update file DB error:", err.message);
			return res.status(500).json({ error: err.message });
		}
		if (this.changes === 0) {
			return res.status(404).json({ error: "File not found" });
		}
		db.get(`SELECT * FROM files WHERE id = ?`, [id], (err2, row) => {
			if (err2 || !row) {
				return res.status(500).json({ error: "DB fetch error" });
			}
			res.status(200).json(row);
		});
	});
});


export default router;