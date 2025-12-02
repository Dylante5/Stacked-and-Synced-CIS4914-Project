import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
      }
    }
  }, []);

  const handleAuthSuccess = (u) => {
    setUser(u);
    setAuthOpen(false);
    navigate("/");
  };

  const handleCreateProject = async () => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      setUser(null);
      navigate("/");
      return;
    }

    const currentUser = JSON.parse(saved);
    const projectName = window.prompt("Enter a name for your new project:");
    if (!projectName) return;

    try {
      const res = await fetch("/api/projectcreation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          userid: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Project creation failed");

      navigate("/app");
    } catch (e) {
      alert(e.message);
    }
  };

  const goToEditor = () => navigate("/app");
  const goToTeams = () => navigate("/teams");

  const firstName = user?.firstName || "there";

  // NOT LOGGED IN
  if (!user) {
    return (
      <section className="flex flex-col items-center justify-center h-screen w-full text-center bg-gray-50">
        <h1 className="text-5xl font-extrabold">Welcome to CodeLink</h1>
        <p className="mt-4 text-lg max-w-xl text-gray-700">
          A collaborative coding environment for teams and classrooms.
        </p>

        <button
          onClick={() => setAuthOpen(true)}
          className="mt-8 px-8 py-3 rounded-lg bg-black text-white hover:bg-gray-800"
        >
          Log in / Create account
        </button>

        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </section>
    );
  }

  // LOGGED IN
  return (
    <section className="space-y-8 app-surface p-6 max-w-6xl mx-auto mt-10 mb-10 !bg-white" style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>
      {/* header/greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className="text-3xl md:text-4xl font-extrabold"
            style={{ color: "#646cff" }}
          >
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-gray-700 max-w-2xl">
            This is your CodeLink home base. From here, you can spin up new
            projects, jump into the editor, or manage your teams for real-time
            collaboration.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold" style={{ color: "#646cff" }}>
          Quick actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* create project */}
          <button
            onClick={handleCreateProject}
            className="flex flex-col items-start justify-between rounded-xl border border-dashed border-[#646cff] bg-white p-4 text-left hover:shadow-md transition-shadow"
          >
            <div>
              <div className="text-sm font-semibold uppercase text-[#646cff]">
                New Project
              </div>
              <div className="mt-1 text-lg font-bold">
                Create a new project
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Start a fresh workspace for your team’s code. You’ll be taken
                straight to the editor once it’s created.
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-[#646cff]">
              + Create Project
            </span>
          </button>

          {/* open editor */}
          <button
            onClick={goToEditor}
            className="flex flex-col items-start justify-between rounded-xl border bg-white p-4 text-left hover:shadow-md transition-shadow"
          >
            <div>
              <div className="text-sm font-semibold uppercase text-[#646cff]">
                Projects
              </div>
              <div className="mt-1 text-lg font-bold">
                Open a project
              </div>
              <p className="mt-2 text-sm text-gray-600">
                View your existing projects or create a new one to begin coding.
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-[#646cff]">
              → Go to Projects
            </span>
          </button>

          {/* go to teams */}
          <button
            onClick={goToTeams}
            className="flex flex-col items-start justify-between rounded-xl border bg-white p-4 text-left hover:shadow-md transition-shadow"
          >
            <div>
              <div className="text-sm font-semibold uppercase text-[#646cff]">
                Collaboration
              </div>
              <div className="mt-1 text-lg font-bold">
                Manage your teams
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Search for existing teams, create a new one, or join your
                classmates and coworkers for group projects.
              </p>
            </div>
            <span className="mt-3 text-sm font-medium text-[#646cff]">
              → Go to Teams
            </span>
          </button>
        </div>
      </section>

      {/* how to use CodeLink */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold" style={{ color: "#646cff" }}>
          How to use CodeLink
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-800">
          <li>
            <strong>Create or join a team.</strong>{" "}
            Go to the <span className="font-semibold">Teams</span> page to
            create a new team for your class or dev group, or join an existing
            one.
          </li>
          <li>
            <strong>Create a project.</strong> Use{" "}
            <span className="font-semibold">“Create New Project”</span> above to
            spin up a new workspace that your team can share.
          </li>
		  <li>
            <strong>Chat with your team.</strong> Use the{" "}
            <span className="font-semibold">“Chat”</span> above to
            start talking to your teammates in real time, or press the {" "} 
			<span className="font-semibold">"Chat"</span> button in the bottom right of the web app.
          </li>
          <li>
            <strong>Open the editor.</strong> On the{" "}
            <span className="font-semibold">Project</span> page, you’ll see the option
			to click one of your projects, which will bring you to the app page.
          </li>
          <li>
            <strong>Collaborate in real time.</strong> When multiple users are
            working on the same document, changes are synced live via
            WebSockets, so everyone sees updates instantly.
          </li>
          <li>
            <strong>Iterate and organize.</strong> Use teams and project-level
            organization to assign work, keep classroom or team projects in one
            place, and reduce context switching.
          </li>
        </ol>
      </section>

      {/* footer */}
      <section className="text-xs text-gray-500">
        Tip: You can always come back to this homepage via the{" "}
        <span className="font-semibold">Home</span> tab in the top navigation.
      </section>
    </section>
  );
}
