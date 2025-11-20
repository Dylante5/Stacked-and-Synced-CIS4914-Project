# Stacked & Synced

A real-time collaborative development environment integrating code editing, version control, terminal, project planning, and communication — all in one place.

---

## Overview

Stacked & Synced is a real-time collaborative coding platform similar to Replit and VS Code Live Share.
It integrates code editing, project planning, version control, and communication into a single workspace.
Designed for both software teams and computer science education, it reduces tool fragmentation and streamlines collaborative workflows.

---

## Features

- Real-time collaborative code editor (Monaco)
- Syntax highlighting and multi-file project support
- Integrated terminal for executing CLI-based programs
- Multi-language compiler/interpreter interface
- GitHub version tracking and integration
- Kanban-style project planning dashboard
- Built-in lightweight chat and comment system

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Monaco Editor
- Vite

### Backend
- Node.js
- WebSockets / CRDT-based collaboration

### Infrastructure
- Docker
- GitHub API
- SQL / Python components

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Dylante5/Stacked-and-Synced-CIS4914-Project.git
cd Stacked-and-Synced-CIS4914-Project/codelink
```

### 2. Install dependencies

#### Frontend
```bash
cd ../web
npm install
```

### 3. Start development servers

#### Start frontend
```bash
cd ../web
npm run dev
```

#### Start backend
```bash
cd ../api
node server.js
```

---

## Folder Structure

```
codelink/
├── api/                          # Backend (Node.js)
│   ├── data/                     # Database files / seeds / storage
│   ├── routes/                   # API route handlers
│   ├── db.js                     # SQLite / DB connection & helpers
│   ├── migrate.js                # Migration script for initializing DB schema
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                 # Main backend server entrypoint
│
└── web/                          # Frontend (React + Vite)
    ├── public/                   # Static assets
    ├── src/                      # Frontend source code
    ├── eslint.config.js          # Linting config
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── tailwind.config.js        # Tailwind CSS config
    └── vite.config.js            # Vite dev/build config
```

---

## Team – Stacked & Synced

- **Dylan Everett** — Project Manager
- **Mark Burnette** — Scrum Master / Frontend Developer
- **Matthew Golden** — Frontend Developer
- **Yan Tong** — Backend Developer / Testing & Debugging

---

## References

- Aho, Timo, et al. “Designing IDE as a Service.” University of Jyväskylä, 2011.
- Goldman, Max, et al. “Real-time Collaborative Coding in a Web IDE.” UIST 2011.
- Tan, Xin, et al. “Understanding Real-Time Collaborative Programming: A Study of Visual Studio Live Share.” ACM TOSEM, 2024.
```
