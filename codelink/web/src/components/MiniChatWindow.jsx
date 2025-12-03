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
    <div className="flex h-full flex-col text-slate-900">
      {/* Team Selector */}
      <select
        className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
      <div className="flex-1 overflow-y-auto rounded-xl bg-slate-100 p-2 mb-2">
        {messages.map((m, i) => {
          const isMe = m.userName === userName;
          const prev = messages[i - 1];
          const showUser = !isMe && (!prev || prev.userName !== m.userName);
          const key = m.id ?? `${m.userName}-${i}`;

          return (
            <div
              key={key}
              className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%] space-y-1 text-xs">
                {showUser && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-[9px] font-semibold uppercase">
                      {m.userName?.[0] ?? "?"}
                    </div>
                    <span>{m.userName}</span>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-indigo-500 text-white"
                      : "border border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  {m.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <div className="mb-2 h-4 text-[11px] text-slate-500">
        {typingList ? `${typingList} is typing…` : ""}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
        <input
          className="flex-1 border-none bg-transparent px-1 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
        />

        <button
          onClick={sendMessage}
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-40"
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
