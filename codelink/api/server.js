import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import { spawn } from '@lydell/node-pty';
import authRoutes from "./routes/auth.js";
import projectcreationRoutes from "./routes/projectcreation.js";
import filesystemRoutes from "./routes/filesystem.js";
import teamsRoutes from "./routes/teams.js";
import chat from "./chat.js";
import runRoutes from "./routes/runcode.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/teams", teamsRoutes);
app.use("/api/projectcreation", projectcreationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/fs", filesystemRoutes);
app.use("/api/run", runRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/health", (_req, res) => res.json({ ok: true }));

io.of("/pty").on("connection", (socket) => {
  const shell = process.platform === "win32" ? "powershell.exe" : "bash";
  const pty = spawn(shell, [], { name: "xterm-color", cols: 80, rows: 24 });

  pty.onData((d) => socket.emit("data", d));
  socket.on("data", (d) => pty.write(d));
  socket.on("resize", ({ cols, rows }) => pty.resize(cols, rows));
  socket.on("disconnect", () => pty.kill());
});

// handle cursor synchronization
io.of("/editor").on("connection", (socket) => {
  socket.on("join", ({ docName, userName }) => {
    socket.join(docName);
    socket.to(docName).emit("joined", userName);
  });

  socket.on("cursor-pos", ({ docName, userName, position }) => {
    socket.to(docName).emit("cursor-pos", { userName, position });
  });

  socket.on("leave", ({ docName, userName }) => {
    socket.to(docName).emit("leave", userName);
  });
});

// handle collaborative editing with Yjs and y-socket.io
const ysocketio = new YSocketIO(io, {
  // authenticate: (auth) => auth.token === 'valid-token',
  // levelPersistenceDir: './storage-location',
  // gcEnabled: true,
});

ysocketio.initialize();

chat(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`API listening on :${PORT}`));
