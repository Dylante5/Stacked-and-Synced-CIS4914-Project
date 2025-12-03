import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./components/AuthModal.jsx";
import FloatingChatWidget from "./components/FloatingChatWidget.jsx";
import Button from "./components/Button.jsx";
import { DarkModeContext } from "./components/DarkModeContext.jsx";


export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const onLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    window.location.reload();
    console.log("here");
  };

  const isEditorRoute =
    location.pathname === "/app" || location.pathname.startsWith("/app/");
  const isProjectRoute = location.pathname === "/project";

  const linkStyle = {
    color: "#646cff",
    opacity: user ? 1 : 0.5,
    pointerEvents: user ? "auto" : "none",
    cursor: user ? "pointer" : "not-allowed",
  }

  return (
    <DarkModeContext value={darkMode}>
      <div className={"min-h-screen " + (darkMode ? "bg-gray-900" : "bg-gray-100")}>
        <header className={"border-b " + (darkMode ? "bg-gray-925" : "bg-white")}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div>
              <Link to="/" className="font-bold" style={{ color: "#646cff" }}>
                CodeLink
              </Link>
              <Button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  marginLeft: "8px",
                  padding: "4px",
                  border: "1px solid",
                  borderColor: (darkMode ? "#646cff" : "black"),
                  borderRadius: "50%"
                }}>
                {darkMode ? "☀️" : "🌙"}
              </Button>
            </div>

            <nav className="flex items-center gap-4">
              {/* Home and App links */}
              <Link
                to="/"
                className="hover:underline"
                style={linkStyle}
              >
                Home
              </Link>

              <Link
                to="/project"
                className="hover:underline"
                style={linkStyle}
              >
                Project
              </Link>

              <Link
                to="/teams"
                className="hover:underline"
                style={linkStyle}
              >
                Teams
              </Link>

              <Link
                to="/chat"
                className="hover:underline"
                style={linkStyle}
              >
                Chat
              </Link>

              { /* Auth button */
                !user ? <Button onClick={() => setShowAuth(true)} children="Log In" />
                  : <Button onClick={onLogout} children="Log Out" />
              }
            </nav>
          </div>
        </header>

        <main
          className={
            isEditorRoute
              ? "flex-1 w-full p-6"
              : `flex-1 p-6 ${isProjectRoute ? "max-w-none" : "max-w-6xl mx-auto"
              }`
          }
        >
          <Outlet />
        </main>

        <footer className="text-center text-sm text-gray-500 p-6">
          CodeLink
        </footer>

        <FloatingChatWidget />

        {showAuth && (
          <AuthModal
            open={showAuth}
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => {
              setUser(u);
              setShowAuth(false);
              navigate("/");
              window.location.reload();
            }}
          />
        )}
      </div>
    </DarkModeContext>
  );
}
