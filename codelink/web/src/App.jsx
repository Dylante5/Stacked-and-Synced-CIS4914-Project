import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./components/AuthModal.jsx";
import FloatingChatWidget from "./components/FloatingChatWidget.jsx";


export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const onLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const isEditorRoute =
    location.pathname === "/app" || location.pathname.startsWith("/app/");
  const isProjectRoute = location.pathname === "/project";
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold" style={{ color: "#646cff" }}>
            CodeLink
          </Link>

          <nav className="flex items-center gap-4">
            {/* Home and App links */}
            <Link
              to="/"
              className="hover:underline"
              style={{
                color: "#646cff",
                opacity: user ? 1 : 0.5,
                pointerEvents: user ? "auto" : "none",
                cursor: user ? "pointer" : "not-allowed",
              }}
            >
              Home
            </Link>
			
			<Link
              to="/project"
              className="hover:underline"
              style={{
                color: "#646cff",
                opacity: user ? 1 : 0.5,
                pointerEvents: user ? "auto" : "none",
                cursor: user ? "pointer" : "not-allowed",
              }}
            >
              Project
            </Link>

            <Link
              to="/teams"
              className="hover:underline"
              style={{
                color: "#646cff",
                opacity: user ? 1 : 0.5,
                pointerEvents: user ? "auto" : "none",
                cursor: user ? "pointer" : "not-allowed",
              }}
            >
              Teams
            </Link>

            {/* Auth button */}
            {!user ? (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  color: "#fff",
                  backgroundColor: "#646cff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.4em 1em",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Log In
              </button>
            ) : (
              <button
                onClick={onLogout}
                style={{
                  color: "#fff",
                  backgroundColor: "#646cff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.4em 1em",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Log Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main
        className={
          isEditorRoute
            ? "flex-1 w-full p-6"
            : `flex-1 p-6 ${
                isProjectRoute ? "max-w-none" : "max-w-6xl mx-auto"
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
            navigate("/project");
          }}
        />
      )}
    </div>
  );
}
