# CodeLink File Structure

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
│   ├── package-lock.json             # backend dependency lock file
│   └── node_modules/                 # Backend installed dependencies (change)
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
│   └── .gitignore
│
Project Reports/                  # documentation for course deliverables
.gitignore                        # root Git ignore rules
README.md                         # project documentation file
```
