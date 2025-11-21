import db from "./db.js";

function chat(io) {
    const chat_namespace = io.of("/chat");

    chat_namespace.on("connection", (socket) => {
        socket.on('join', ({ teamId, userName }) => {
            socket.join(teamId);
            //console.log(`${userName} joined room: ${teamId}`);

            const history = [];
            db.all(`SELECT id, userName, message FROM chatHistory WHERE team_id = ? ORDER BY timestamp ASC`, [teamId], (err, rows) => {
                if (err)
                    console.log("DB error when fetching chat history:", err);

                rows.forEach(row => {
                    history.push(row);
                });
                socket.emit('history', history);
            });
        });

        socket.on('message', ({ teamId, message }) => {
            const stmt = db.prepare(
                `INSERT INTO chatHistory (team_id, userName, message) VALUES (?, ?, ?)`
            );
            stmt.run(teamId, message.userName, message.message, function (err) {
                if (err)
                    console.log("DB error when logging message:", err);
            });
            socket.to(teamId).emit('message', message);
        });

        socket.on('typing', ({ teamId, userName, isTyping }) => {
            chat_namespace.to(teamId).emit('typing', { userName, isTyping });
        });
    });
}

export default chat;