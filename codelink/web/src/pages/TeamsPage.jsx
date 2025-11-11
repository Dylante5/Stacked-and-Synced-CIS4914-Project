import { useEffect, useState } from "react";

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mine, setMine] = useState([]);
  const [error, setError] = useState("");

  const [membersByTeam, setMembersByTeam] = useState({});
  
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
        body: JSON.stringify({ name, description, userId: user.id }),
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

  const toggleMembers = async (teamId) => {
    setMembersByTeam((prev) => {
      const cur = prev[teamId] || { open: false, loading: false, members: [] };
      if (cur.members && cur.members.length > 0 && !cur.loading) {
        return { ...prev, [teamId]: { ...cur, open: !cur.open } };
      }
      return { ...prev, [teamId]: { ...cur, open: true, loading: true, error: "" } };
    });

    const cur = membersByTeam[teamId];
    if (cur && cur.members?.length) return;

    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load members");

      setMembersByTeam((prev) => ({
        ...prev,
        [teamId]: {
          open: true,
          loading: false,
          error: "",
          members: data.members || [],
        },
      }));
    } catch (e) {
      setMembersByTeam((prev) => ({
        ...prev,
        [teamId]: {
          open: true,
          loading: false,
          error: e.message || "Failed to load members",
          members: [],
        },
      }));
    }
  };
  
  const onDeleteTeam = async (team) => {
  if (String(team.role).toLowerCase() !== "owner") {
    alert("Only the Owner can delete this team.");
    return;
  }
  if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;

  try {
    const res = await fetch(`/api/teams/${team.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),  // body (backend also accepts ?userId=)
    });
    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json") ? await res.json() : { error: await res.text() };
    if (!res.ok) throw new Error(payload?.error || "Delete failed");

    setMine((prev) => prev.filter((x) => x.id !== team.id));
    setTeams((prev) => prev.filter((x) => x.id !== team.id));
    setMembersByTeam((prev) => { const copy = { ...prev }; delete copy[team.id]; return copy; });
    alert(`Deleted team "${team.name}".`);
  } catch (e) {
    alert(e.message || "Delete failed");
};
  }



  return (
    <div className="space-y-8">
      <section className="app-surface p-4 rounded-xl !bg-white" style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>
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
            <li key={t.id} className="flex items-center justify-between rounded-lg p-3 border">
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

      <section className="app-surface p-4 rounded-xl !bg-white" style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>
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
		<section className="app-surface p-4 rounded-xl !bg-white" style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>
		  <h2 className="text-2xl font-bold" style={{ color: "#646cff" }}>
			My Teams
		  </h2>
		  <ul className="mt-3 space-y-2">
			{mine.map((t) => {
			  const entry = membersByTeam[t.id] || {};
			  return (
				<li key={t.id} className="rounded-lg bg-white p-3 border">
				  <div className="flex items-center justify-between gap-3">
					<div>
					  <div className="font-semibold" style={{ color: "#646cff" }}>
						{t.name}
					  </div>
					  <div className="text-sm text-gray-600">{t.description}</div>
					</div>
					<div className="flex items-center space-x-2">
						<button
						  onClick={() => toggleMembers(t.id)}
						  className="rounded-md border px-3 py-1 text-sm"
						  style={{ borderColor: "#646cff", color: "#646cff" }}
						>
						  {entry.open ? "Hide Members" : "View Members"}
						</button>
						
						<button
						  onClick={() => onDeleteTeam(t)}
						  disabled={String(t.role).toLowerCase() !== "owner"}
						  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
						  style={{ borderColor: "#ef4444", color: "#ef4444" }}
						  title={String(t.role).toLowerCase() !== "owner" ? "Only Owner can delete" : "Delete team"}
						> Delete </button>
					</div>
				  </div>
				  {entry.open && (
					<div className="mt-3">
					  {entry.loading && (
						<div className="text-sm text-gray-500">Loading members…</div>
					  )}
					  {entry.error && (
						<div className="text-sm text-red-600">{entry.error}</div>
					  )}
					  {!entry.loading && !entry.error && (
						<>
						  {entry.members?.length ? (
							<ul className="mt-2 space-y-1">
							  {entry.members.map((m) => (
								<li key={m.id} className="text-sm">
								  <span className="font-medium">{m.username}</span>
								  {(m.firstname || m.lastname) && (
									<span className="text-gray-600">
									  {" "}
									  — {m.firstname || ""} {m.lastname || ""}
									</span>
								  )}
								  {m.role && (
									<span className="text-gray-500"> ({m.role})</span>
								  )}
								</li>
							  ))}
							</ul>
						  ) : (
							<div className="text-sm text-gray-500">
							  No members yet.
							</div>
						  )}
						</>
					  )}
					</div>
				  )}
				</li>
			  );
			})}
			{mine.length === 0 && (
			  <p className="text-sm text-gray-600">
				You haven't joined any teams yet.
			  </p>
			)}
		  </ul>
		</section>
      )}
    </div>
  );
}
