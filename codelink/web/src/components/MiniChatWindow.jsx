import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export default function MiniChatWindow() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.firstName || "UnknownUser";
  const teams = user?.teams || [];
  const initialTeamId = teams.length > 0 ? teams[0].id : "test-room";
  const [teamId, setTeamId] = useState(initialTeamId);

  useEffect(() => {
    const s = io(`${SOCKET_URL}/chat`, {
      autoConnect: true,
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      if (teamId) s.emit("join", { teamId, userName });
    });

    s.on("message", (msg) => {
      setMessages((old) => [...old, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

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

  const sendMessage = () => {
    if (!socket || !teamId) return;
    if (!text.trim()) return;

    const msg = {
      id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 1,
      userName: userName,
      message: text.trim(),
    };

    socket.emit("message", { teamId, message: msg });
    setMessages((old) => [...old, msg]);
    setText("");

    socket.emit("typing", { teamId, userName, isTyping: false });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  const handleTyping = (e) => {
    const newText = e.target.value;
    setText(newText);

    if (!socket) return;

    if (newText.length === 1)
      socket.emit("typing", { teamId, userName, isTyping: true });
    else if (newText.length === 0)
      socket.emit("typing", { teamId, userName, isTyping: false });
  };

  const typingList = Object.keys(typingUsers).filter(Boolean).join(", ");

  return (
    <div className="flex flex-col h-full">

      {/* Team Selector */}
      <select
        className="text-black mb-2 border rounded p-1"
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
      >
        {teams.length === 0 && <option value="test-room">Debug Room</option>}
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto border rounded p-2 bg-gray-50 text-black mb-2">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showUser = !prev || prev.userName !== m.userName;

          return (
            <div key={m.id} className="mb-1 text-sm">
              {showUser && (
                <div className="text-xs text-gray-500">{m.userName}</div>
              )}
              <div className="inline-block bg-gray-200 px-2 py-1 rounded">
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <div className="h-4 text-xs text-black mb-2">
        {typingList ? `${typingList} is typing...` : ""}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-black"
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-3 py-1 rounded text-white whitespace-nowrap"
          style={{ backgroundColor: "#646cff" }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#535bf2")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#646cff")
          }
        >
          Send
        </button>
      </div>
    </div>
  );
}

