import { useEffect, useState, useContext } from "react";
import "../components/Button.jsx"
import Button from "../components/Button.jsx";
import Heading from "../components/Heading.jsx";
import Section from "../components/Section.jsx";
import Paragraph from "../components/Paragraph.jsx";
import Input from "../components/Input.jsx";
import Label from "../components/Label.jsx";
import { DarkModeContext } from "../components/DarkModeContext";

export default function TeamsPage() {
  const darkMode = useContext(DarkModeContext);

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
      <Section className={"app-surface p-4 rounded-xl"}>
        <Heading>Search Teams</Heading>
        <div className="mt-3 flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team name…"
          />
          <Button onClick={load} children="Search" />
        </div>
        <ul className="mt-4 space-y-2">
          {teams.map((t) => (
            <li key={t.id}
              className={"flex items-center justify-between rounded-lg p-3 border " + (darkMode ? "border-gray-100" : "border-gray-600")}>
              <div>
                <Heading level={3}>{t.name}</Heading>
                <Paragraph>{t.description}</Paragraph>
              </div>
              <Button onClick={() => join(t.id)} children="Join" />
            </li>
          ))}
          {teams.length === 0 && <Paragraph>No teams found!</Paragraph>}
        </ul>
      </Section>

      <Section className={"app-surface p-4 rounded-xl"}>
        <Heading>Create a Team</Heading>
        <form onSubmit={createTeam} className="mt-3 space-y-3">
          <div>
            <Label htmlFor="teamname">Team name</Label>
            <Input
              id="teamname"
              value={name}
              onChange={(e) => setName(e.target.value)} required
            />
          </div>
          <div>
            <Label htmlFor="teamDesc">Description</Label>
            <textarea
              id="teamDesc"
              className={"mt-1 w-full rounded-lg border px-3 py-2 " + (darkMode ? "text-gray-100" : "text-gray-600")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          {error && <Paragraph style={{ "!text-color": "red" }}>{error}</Paragraph> /* TODO: fix color */}
          <Button children={"Create"} />
        </form>
      </Section>

      {user && (
        <Section className={"app-surface p-4 rounded-xl"}>
          <Heading>My Teams</Heading>
          <ul className="mt-3 space-y-2">
            {mine.map((t) => {
              const entry = membersByTeam[t.id] || {};
              return (
                <li key={t.id}
                className={"rounded-lg p-3 border " + (darkMode ? "border-gray-100" : "border-gray-600")}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Heading level={3}>{t.name}</Heading>
                      <Paragraph>{t.description}</Paragraph>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => toggleMembers(t.id)} children={entry.open ? "Hide Members" : "View Members"} />
                      <Button onClick={() => onDeleteTeam(t)}
                        disabled={String(t.role).toLowerCase() !== "owner"}
                        className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                        style={{ backgroundColor: "#ef4444" }}
                        title={String(t.role).toLowerCase() !== "owner" ? "Only Owner can delete" : "Delete team"}
                        children="Delete"
                      />
                    </div>
                  </div>
                  {entry.open && (
                    <div className="mt-3">
                      {entry.loading && <Paragraph>Loading members...</Paragraph>}
                      {entry.error && <Paragraph>{entry.error}</Paragraph> /* TODO: red text */}
                      {!entry.loading && !entry.error && (
                        entry.members?.length ? (
                          <ul className="mt-2 space-y-1">
                            {entry.members.map((m) => (
                              <li key={m.id} className="text-sm">
                                <span className="font-medium">{m.username}</span>
                                <span className={darkMode ? "text-gray-600" : "text-gray-100"}> ({m.role})</span>
                              </li>
                            ))}
                          </ul>
                        ) :
                          <Paragraph>No members yet.</Paragraph>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            {mine.length === 0 && (
              <Paragraph>You haven't joined any teams yet.</Paragraph>
            )}
          </ul>
        </Section>
      )}
    </div>
  );
}
