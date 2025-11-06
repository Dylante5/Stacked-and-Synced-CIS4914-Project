import db from "../db.js";

export function CreateProject(name, id) {
    db.run('INSERT INTO projects (name, user1) VALUES (?, ?)', [name, id]);
}

export function DeleteProject(id) {
    db.run('DELETE FROM projects WHERE id = ?', [id]);
}

export function GetUsersProjects(id) {
    return db.get('SELECT id FROM projects WHERE user1 = ? OR user2 = ? OR user3 = ? OR user4 = ? OR user5 = ? OR user6 = ? OR user7 = ? OR user8 = ? OR user9 = ? OR user10 = ?',
        [id, id, id, id, id, id, id, id, id, id]);
}

export function GetProjectInfo(id) {
    return db.get('SELECT * FROM projects WHERE id = ?', [id]);
}

export function AddProjectUser(user_id, project_id) {
    var id = project_id;
    var name = user_id;
    if (db.get(`SELECT user1 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user1 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user2 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user2 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user3 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user3 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user4 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user4 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user5 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user5 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user6 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user6 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user7 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user7 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user8 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user8 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user9 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user9 = ${name} WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user10 FROM projects where id = ${id}`) = null) {
        db.run(`UPDATE projects SET user10 = ${name} WHERE id = ${id}`)
    }
    else {
        throw new Error("Max User Capacity");
    }
}

export function RemoveProjectUser(user_id, project_id) {
    var id = project_id;
    var name = user_id;
    if (db.get(`SELECT user1 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user1 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user2 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user2 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user3 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user3 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user4 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user4 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user5 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user5 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user6 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user6 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user7 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user7 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user8 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user8 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user9 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user9 = null WHERE id = ${id}`)
    }
    else if (db.get(`SELECT user10 FROM projects where id = ${id}`) = name) {
        db.run(`UPDATE projects SET user10 = null WHERE id = ${id}`)
    }
    else {
        throw new Error("Invalid Name");
    }
    if (db.get(`SELECT user1 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user2 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user3 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user4 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user5 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user6 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user7 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user8 FROM projects where id = ${id}`) == null
    && db.get(`SELECT user9 FROM projects where id = ${id}`) == null
        && db.get(`SELECT user10 FROM projects where id = ${id}`) == null)
    {
        db.run(`DELETE FROM projects WHERE project_id = ${id}`);
    }
}

export function DeleteUser(id) {
    db.run('DELETE FROM users WHERE id = ?', [id]);
}
