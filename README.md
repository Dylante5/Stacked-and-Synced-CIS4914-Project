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
codelink/			      # codelink project folder
│
├── api/                              # backend (Node.js, Express, SQLite)
│   ├── routes/                       # all backend API route handlers
│   │   ├── auth.js
│   │   ├── dbfunctions.js
│   │   ├── projectcreation.js
│   │   └── teams.js
│   │
│   ├── data/                         # SQLite database storage
│   │   └── codelink.db
│   │
│   ├── db.js                         # database connection and schema creation
│   ├── migrate.js                    # migration script for user table updates
│   ├── server.js                     # express + Socket.IO backend server
│   ├── package.json                  # backend dependencies and scripts
│   └── package-lock.json             # backend dependency lock file
│
├── web/                              # frontend (React, Vite, Tailwind, Monaco)
│   ├── public/                       # public static files
│   │
│   ├── src/                          # main React application
│   │   ├── assets/                   # images/static assets
│   │   ├── components/               # reusable UI components
│   │   │   ├── AuthModal.jsx
│   │   │   ├── Editor.jsx
│   │   │   └── Terminal.jsx
│   │   │
│   │   ├── Functions/                # logical helpers/utilities
│   │   │   └── FileFunctions.jsx
│   │   │
│   │   ├── pages/                    # route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── EditorPage.jsx
│   │   │   ├── ProjectPage.jsx
│   │   │   └── TeamsPage.jsx
│   │   │
│   │   ├── App.jsx                   # layout and routing wrapper
│   │   ├── main.jsx                  # react root mount point
│   │   ├── App.css                   # component-specific styles
│   │   └── index.css                 # global styles and Tailwind import
│   │
│   ├── index.html                    # Frontend entry HTML template
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # TailwindCSS config
│   ├── eslint.config.js              # ESLint config
│   ├── package.json                  # frontend dependencies and scripts
│   ├── package-lock.json             # frontend dependency lock file
│
Project Reports/                  # documentation for course deliverables
.gitignore                        # root Git ignore rules
README.md                         # project documentation file
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

## License

Third-party packages used in this project retain their respective licenses, which can be found in the project’s **`package-lock.json`** files in the web and api directories.
