import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectPage() {
    const navigate = useNavigate();
    const [teamId, setTeamId] = useState("");
    const [projects, setProjects] = useState([]);
    const [err, setErr] = useState("");

    const rawUser = localStorage.getItem("user");
    let user = null;
    try {
        user = rawUser ? JSON.parse(rawUser) : null;
    } catch { user = null; }

    useEffect(() => {
        (async () => {
            if (!user?.id) {
                setErr("No user detected. Please log in again.");
                return;
            }

            try {
                const res = await fetch(`/api/teams/mine?userId=${user.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load teams");

                if (data.teams.length > 0) {
                    const id = String(data.teams[0].id);
                    setTeamId(id);
                } else {
                    setErr("You are not in a team yet.");
                }
            } catch (e) {
                setErr(e.message);
            }
        })();
    }, []);

    useEffect(() => {
        if (!teamId) return;

        (async () => {
            try {
                const res = await fetch(`/api/projectcreation/by-team/${teamId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Could not load projects");

                setProjects(data.projects || []);
            } catch (e) {
                setErr(e.message);
            }
        })();
    }, [teamId]);

    const onCreate = async () => {
        setErr("");

        if (!teamId) {
            alert("No team detected. Join a team first.");
            return;
        }

        const projectName = prompt("Input New Project Name");
        if (!projectName) return;

        try {
            const res = await fetch("/api/projectcreation/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: projectName, teamId: Number(teamId) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Request failed");
            //const res2 = await fetch("/api/filesystem/createfolder", {
            //    method: "POST",
            //    body: JSON.stringify({ name: projectName, project_id: data.project.id, parent: -1}),
            //});
            //if (!res2.ok) throw new Error(data?.error || "Request failed");

            setProjects((prev) => [...prev, data.project]);

            navigate(`/app?projectId=${data.project.id}`);

        } catch (e2) {
            setErr(e2.message);
        }
    };

    return (
        <section className="p-8">
            <h1 className="text-4xl font-extrabold text-center mb-6">
                Your Projects
            </h1>

            <button
                onClick={onCreate}
                className="px-4 py-2 rounded-lg border-2 border-indigo-500 text-indigo-600 mb-6"
            >
                + Create New Project
            </button>

            {err && <p className="text-red-600">{err}</p>}

            <div className="grid grid-cols-3 gap-4">
                {projects.map((p) => (
                    <div
                        key={p.id}
                        className="border p-4 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/app?projectId=${p.id}`)}
                    >
                        <h2 className="font-bold text-lg">{p.name}</h2>
                        <p className="text-sm text-gray-600">
                            Project ID: {p.id}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}


