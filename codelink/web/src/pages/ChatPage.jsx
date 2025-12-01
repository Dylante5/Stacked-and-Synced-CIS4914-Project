import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000"; // TODO: don't hardcode

export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [typingUsers, setTypingUsers] = useState({});
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.firstName;
    const teams = user.teams||[];

    const [teamId, setTeamId] = useState(teams ? teams[0]?.id : null);

    // connect/disconnect socket on mount/unmount
    useEffect(() => {
        const s = io(`${SOCKET_URL}/chat`, {
            autoConnect: true,
        });
        setSocket(s);

        s.on('message', (msg) => {
            setMessages((msgs) => [...msgs, msg]);
        });

        return () => {
            s.removeAllListeners();
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !teamId) return;

        socket.emit('join', { teamId, userName });

        // get chat history on room change
        socket.on('history',  (history) => {
            setMessages(history);
        });

        // update list of users currently typing
        socket.on('typing', ({ userName, isTyping }) => {
            setTypingUsers((prev) => {
                const updated = { ...prev };
                if (isTyping) updated[userName] = true;
                else delete updated[userName];
                return updated;
            });
        });

        return () => {
            socket.off('history');
            socket.off('typing');
        };
    }, [socket, teamId, userName]);

    const sendMessage = () => {
        if (!socket || !teamId) return;
        if (!text.trim()) return; // ignore empty messages

        const msg = {
            id: messages[messages.length - 1] ? messages[messages.length - 1].id + 1 : 1,
            userName: userName, // TODO: security vulnerability
            message: text.trim(),
        };
        socket.emit('message', { teamId: teamId, message: msg });
        setMessages((msgs) => [...msgs, msg]);
        setText("");
        socket.emit('typing', { teamId, userName, isTyping: false });
    }

    // auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }, [messages]);

    const handleTyping = (e) => {
        setText(e.target.value);

        if (!socket) return;

        // keeping track of previous text length to avoid redundant emits ("text" is one tick behind)
        if (e.target.value.length > 0 && text.length === 0)
            socket.emit('typing', { teamId, userName, isTyping: true });
        else if (e.target.value.length === 0 && text.length > 0)
            socket.emit('typing', { teamId, userName, isTyping: false });
    };

    const typingList = Object.keys(typingUsers).filter(Boolean).join(', ');

    return (
        <div className="border rounded p-3 flex flex-col h-96">
            {/* team selector */}
            <div>
                <select id="team-selector" className="text-black" onChange={(e) => setTeamId(e.target.value)}>
                    {/* <option>Select a team...</option> */}
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 overflow-auto mb-2">
                {messages.map((m, i) => {
                    if (m.system) return ( // TODO: add system messages
                        <div key={m.ts} className="text-xs text-gray-500 text-center">
                            {m.message}
                        </div>
                    );

                    // batch messages by user
                    const prevMessage = messages[i - 1];
                    const showUser = !prevMessage || prevMessage.userName !== m.userName;

                    return (
                        <div key={m.id} className={`mb-2 ${m.userName === userName ? 'text-right' : 'text-left'}`}>
                            {showUser && <div className="text-xs text-gray-400">{m.userName}</div>}
                            <div className="inline-block bg-gray-200 text-black rounded px-3 py-1 text-sm">{m.message}</div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="mb-2 text-xs text-black">{typingList ? `${typingList} is typing...` : ''}</div>

            <div className="flex gap-2">
                <input
                    className="flex-1 border rounded px-2 py-1 text-black"
                    value={text}
                    onChange={handleTyping}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
                />
                <button
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}