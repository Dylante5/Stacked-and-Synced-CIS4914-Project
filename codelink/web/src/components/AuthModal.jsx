import { useState } from "react";

export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [team, setTeam] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { username, password }
          : { username, password, firstName, lastName, team };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Request failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      onSuccess?.(data.user);
      onClose();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const color = "#646cff";
  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300/50 bg-white text-black " +
    "dark:bg-[#1a1a1a] dark:text-white dark:border-white/10 px-3 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-[#646cff]";
  const labelCls = "block text-sm font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-xl app-surface p-6"
        style={{ color }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "login" ? "Log in" : "Create account"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: 0,
              color,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className={labelCls}>Username</label>
            <input
              className={inputCls}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First name</label>
                  <input
                    className={inputCls}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Last name</label>
                  <input
                    className={inputCls}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Team</label>
                <input
                  className={inputCls}
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {err && <p style={{ color: "red" }}>{err}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              color: "#fff",
              backgroundColor: color,
              width: "100%",
              padding: "0.6em 1.2em",
              borderRadius: "8px",
              fontWeight: "500",
              fontFamily: "inherit",
              border: "none",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => setMode("register")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: 0,
                color,
                cursor: "pointer",
              }}
            >
              Don’t have an account? Create one
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: 0,
                color,
                cursor: "pointer",
              }}
            >
              Already have an account? Log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
