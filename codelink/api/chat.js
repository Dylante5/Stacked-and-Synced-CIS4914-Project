import db from "./db.js";

function chat(io) {
    const chat_namespace = io.of("/chat");

    chat_namespace.on("connection", (socket) => {
        
        // join team chat room
        socket.on("join", ({ teamId, userName }) => {
            socket.join(teamId);

            // Load chat history for team
            db.all(
                `SELECT id, userName, message FROM chatHistory WHERE team_id = ? ORDER BY timestamp ASC`,
                [teamId],
                (err, rows) => {
                    if (err) {
                        console.log("DB error when fetching chat history:", err);
                        return;
                    }

                    socket.emit("history", rows);
                }
            );
        });

        // handle messages
        socket.on("message", ({ teamId, message }) => {
            const stmt = db.prepare(
                `INSERT INTO chatHistory (team_id, userName, message) VALUES (?, ?, ?)`
            );

            stmt.run(teamId, message.userName, message.message, function (err) {
                if (err)
                    console.log("DB error when logging message:", err);
            });

            // send to everyone except sender
            socket.to(teamId).emit("message", message);
        });

        // typing indicator broadcast
        socket.on("typing", ({ teamId, userName, isTyping }) => {
            chat_namespace.to(teamId).emit("typing", { userName, isTyping });
        });
    });
}

export default chat;
