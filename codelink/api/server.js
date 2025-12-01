import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
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

io.of("/docs").on("connection", (socket) => {
  let room = "";
  socket.on("join", (docId) => { room = docId; socket.join(room); });
  socket.on("op", (payload) => socket.to(room).emit("op", payload));
  socket.on("chat", (msg) => io.of("/docs").to(room).emit("chat", msg));
});

chat(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`API listening on :${PORT}`));
