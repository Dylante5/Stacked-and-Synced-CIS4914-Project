import { useEffect, useState } from "react";

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mine, setMine] = useState([]);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const load = async () => {
    setError("");
    try {
      const res = await fetch(`/api/teams${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (e) {
      setError("Failed to load teams");
    }
  };

  const loadMine = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/teams/mine?userId=${user.id}`);
      const data = await res.json();
      setMine(data.teams || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { load(); }, []); // initial
  useEffect(() => { loadMine(); }, []); // my teams

  const createTeam = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      setName(""); setDescription("");
      load(); loadMine();
    } catch (e2) {
      setError(e2.message);
    }
  };

  const join = async (teamId) => {
    if (!user) return alert("Please log in to join a team.");
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Join failed");
      loadMine();
      alert("Joined team!");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      <section className="app-surface p-4 rounded-xl">
        <h2 className="text-2xl font-bold" style={{ color: "#646cff" }}>Search Teams</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team name…"
            className="w-full rounded-lg border px-3 py-2"
          />
          <button onClick={load} style={{ backgroundColor: "#646cff", color: "#fff", borderRadius: 8, padding: "0.5em 1em", border: "none" }}>
            Search
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {teams.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg bg-white p-3 border">
              <div>
                <div className="font-semibold" style={{ color: "#646cff" }}>{t.name}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
              </div>
              <button onClick={() => join(t.id)} style={{ backgroundColor: "#646cff", color: "#fff", borderRadius: 8, padding: "0.4em 0.9em", border: "none" }}>
                Join
              </button>
            </li>
          ))}
          {teams.length === 0 && <p className="text-sm text-gray-600">No teams found.</p>}
        </ul>
      </section>

      <section className="app-surface p-4 rounded-xl">
        <h2 className="text-2xl font-bold" style={{ color: "#646cff" }}>Create a Team</h2>
        <form onSubmit={createTeam} className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium">Team name</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" style={{ backgroundColor: "#646cff", color: "#fff", borderRadius: 8, padding: "0.6em 1.2em", border: "none" }}>
            Create
          </button>
        </form>
      </section>

      {user && (
        <section className="app-surface p-4 rounded-xl">
          <h2 className="text-2xl font-bold" style={{ color: "#646cff" }}>My Teams</h2>
          <ul className="mt-3 space-y-2">
            {mine.map((t) => (
              <li key={t.id} className="rounded-lg bg-white p-3 border">
                <div className="font-semibold" style={{ color: "#646cff" }}>{t.name}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
              </li>
            ))}
            {mine.length === 0 && <p className="text-sm text-gray-600">You haven't joined any teams yet.</p>}
          </ul>
        </section>
      )}
    </div>
  );
}
