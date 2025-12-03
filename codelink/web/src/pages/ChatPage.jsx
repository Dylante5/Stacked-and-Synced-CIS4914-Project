import { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
import Button from "../components/Button";
import Input from "../components/Input";
import { DarkModeContext } from "../components/DarkModeContext";

const SOCKET_URL = "http://localhost:4000"; // TODO: don't hardcode

export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [typingUsers, setTypingUsers] = useState({});
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.firstName || "UnknownUser";
    const teams = user.teams || [];

    const [teamId, setTeamId] = useState(teams.length > 0 ? teams[0].id : null);
    const darkMode = useContext(DarkModeContext);

    // Always refresh team info from backend
    useEffect(() => {
        async function refreshTeams() {
            if (!user?.id) return;

            const res = await fetch(`/api/teams/mine?userId=${user.id}`);
            const data = await res.json();

            user.teams = data.teams || [];
            localStorage.setItem("user", JSON.stringify(user));

            // reset teamId
            if (data.teams.length > 0) {
                setTeamId(data.teams[0].id);
            } else {
                setTeamId("test-room");
            }
        }

        refreshTeams();
    }, []);

    // Initialize socket connection
    useEffect(() => {
        const s = io(`${SOCKET_URL}/chat`, {
            autoConnect: true,
            transports: ["websocket"], // force websocket for stability
        });

        setSocket(s);

        s.on("connect", () => {
            console.log("Chat connected:", s.id);
            if (teamId)
                s.emit("join", { teamId, userName }); // join only after connect
        });

        // Receive individual incoming messages
        s.on("message", (msg) => {
            setMessages((old) => [...old, msg]);
        });

        return () => {
            s.removeAllListeners();
            s.disconnect();
        };
    }, []);

    // Handle team join, history load, typing updates
    useEffect(() => {
        if (!socket || !teamId) return;

        socket.emit("join", { teamId, userName });

        socket.on("history", (history) => {
            setMessages(history);
        });

        socket.on("typing", ({ userName, isTyping }) => {
            setTypingUsers((prev) => {
                const u = { ...prev };
                if (isTyping) u[userName] = true;
                else delete u[userName];
                return u;
            });
        });

        return () => {
            socket.off("history");
            socket.off("typing");
        };
    }, [socket, teamId, userName]);

    // Send message
    const sendMessage = () => {
        if (!socket || !teamId) return;
        if (!text.trim()) return;

        const msg = {
            id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 1, // TODO: backend should generate ID
            userName: userName,
            message: text.trim(),
        };

        socket.emit("message", { teamId, message: msg });
        setMessages((old) => [...old, msg]);
        setText("");

        socket.emit("typing", { teamId, userName, isTyping: false });
    };

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }, [messages]);

    // Handle typing indicator
    const handleTyping = (e) => {
        const newText = e.target.value;
        setText(newText);

        if (!socket) return;

        // stable typing detection (remove race condition)
        if (newText.length === 1) {
            socket.emit("typing", { teamId, userName, isTyping: true });
        } else if (newText.length === 0) {
            socket.emit("typing", { teamId, userName, isTyping: false });
        }
    };

    const typingList = Object.keys(typingUsers).filter(Boolean).join(", ");

    return (
        <div className="border rounded p-3 flex flex-col h-96">
            {/* team selector */}
            <div>
                <select
                    id="team-selector"
                    className={darkMode ? "text-gray-100" : "text-gray-800"}
                    onChange={(e) => setTeamId(Number(e.target.value))} // ensure numeric room ID
                >
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-auto mb-2">
                {messages.map((m, i) => {
                    if (m.system) {
                        return (
                            <div key={m.ts} className={"text-xs text-center " + (darkMode ? "text-gray-100" : "text-gray-800")}>
                                {m.message}
                            </div>
                        );
                    }

                    const prevMessage = messages[i - 1];
                    const showUser = !prevMessage || prevMessage.userName !== m.userName;

                    return (
                        <div key={m.id} className={`mb-2 ${m.userName === userName ? "text-right" : "text-left"}`}>
                            {showUser && <div className={"text-xs " + (darkMode ? "text-gray-100" : "text-gray-800")}>{m.userName}</div>}
                            <div className="inline-block bg-gray-200 text-black rounded px-3 py-1 text-sm">
                                {m.message}
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* typing indicator */}
            <div className={"mb-2 text-xs " + (darkMode ? "text-gray-100" : "text-gray-800")}>
                {typingList ? `${typingList} is typing...` : ""}
            </div>

            {/* input box */}
            <div className="flex gap-2">
                <Input
                    value={text}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}

                />
                <Button
                    onClick={sendMessage}
                    children="Send"
                />
            </div>
        </div>
    );
}
