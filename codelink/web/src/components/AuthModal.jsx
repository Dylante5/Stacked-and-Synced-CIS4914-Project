import { useState } from "react";
import Button from "./Button";

export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
          : { username, password, firstName, lastName };

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

  const inputCls =
    "mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 " +
    "px-3 py-2.5 text-sm text-slate-900 shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 " +
    "dark:bg-slate-900/70 dark:text-slate-100 dark:border-slate-700";

  const labelCls =
    "block text-xs font-semibold uppercase tracking-wide text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-slate-900/90">
          <Button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-slate-200/70 px-2 py-1 text-xs font-medium shadow-sm hover:text-slate-700"
            children="✕"
          />
          <div className="border-b border-slate-200/60 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 px-6 pt-6 pb-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
              CODELINK
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === "login"
                ? "Log in to jump back into your workspace."
                : "Sign up to start collaborating in real time."}
            </p>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium dark:bg-slate-800">
                <Button
                  onClick={() => setMode("login")}
                  className={"flex-1 flex items-center justify-center text-center rounded-full px-3 py-1.5 transition"}
                  children="Log in"/>
                <Button
                  onClick={() => setMode("register")}
                  className={"flex-1 flex items-center justify-center text-center rounded-full px-3 py-1.5 transition"}
                  children="Sign up"/>
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className={labelCls}>Username</label>
              <input
                className={inputCls}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
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
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "register" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            )}

            {err && (
              <p className="text-sm font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 dark:bg-rose-950/40 dark:border-rose-900/40">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
