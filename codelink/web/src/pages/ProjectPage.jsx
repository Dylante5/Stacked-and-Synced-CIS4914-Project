import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
	const navigate = useNavigate();
	const [teamId, setTeamId] = useState("");
	const [err, setErr] = useState("");

	const rawUser = localStorage.getItem("user");
	let user = null;
	try {
	  user = rawUser ? JSON.parse(rawUser) : null;
	} catch {
	  user = null;
	}
	
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

		  const teams = data?.teams || [];
		  if (teams.length > 0) {
			setTeamId(String(teams[0].id));
		  } else {
			setErr("You are not in a team yet.");
		  }
		} catch (e) {
		  setErr(e.message || "Failed to load teams");
		}
	  })();
	}, []);
	
	const onCreate = async (e) => {
		e.preventDefault();
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

			
			localStorage.setItem("activeTeamId", String(teamId));
			navigate(`/app?projectId=${data.project.id}`);
		} catch (e2) {
		setErr(e2.message || "Create failed");
		}
	};
	
    return (
        <section className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
                <h1 className="text-center text-5xl font-extrabold">Select Your Project or Create a New One</h1>
            </div>
            <button 
                onClick={onCreate}
                style={{
                    border: "dotted",
                    borderRadius: "8px",
                    borderColor: "#646cff",
                    padding: "0.4em 1em",
                    fontWeight: 500,
                    cursor: "pointer",
                    height: 140
                }}>Create New Project</button>
			{err && (
				<div className="col-span-4 text-red-600 text-sm">{err}</div>
			)}
        </section>
    );
}


