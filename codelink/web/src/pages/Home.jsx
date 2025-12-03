import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import Section from "../components/Section";
import { DarkModeContext } from "../components/DarkModeContext";
import Heading from "../components/Heading";
import Paragraph from "../components/Paragraph";
import Button from "../components/Button";

export default function Home() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const darkMode = useContext(DarkModeContext);

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
      <Section className="flex flex-col items-center justify-center h-screen w-full text-center bg-gray-50">
        <Heading level={1}>Welcome to CodeLink</Heading>
        <Paragraph className="mt-4 text-lg max-w-xl">A collaborative coding environment for teams and classrooms.</Paragraph>

        <Button
          onClick={() => setAuthOpen(true)}
          className="mt-8 px-8 py-3 rounded-lg hover:bg-gray-800"
          children="Log In / Create Account"
        />

        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </Section>
    );
  }

  // LOGGED IN
  return (
    <Section className="space-y-8 app-surface p-6 max-w-6xl mx-auto mt-10 mb-10">
      {/*<section  style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>*/}
      {/* header/greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Heading level={1}>
            Welcome back, {firstName}
          </Heading>
          <Paragraph className="mt-2 max-w-2xl">
            This is your CodeLink home base. From here, you can spin up new
            projects, jump into the editor, or manage your teams for real-time
            collaboration.
          </Paragraph>
        </div>
      </div>

      <Section className="space-y-3" style={{ "boxShadow": "none" }}>
        <Heading level={2}>Quick actions</Heading>
        <div className="grid gap-4 md:grid-cols-3">
          {/* create project */}
          <Button
            onClick={handleCreateProject}
            className="flex flex-col items-start justify-between rounded-xl p-4 text-left hover:shadow-md transition-shadow"
            style={{
              backgroundColor: darkMode ? "#384153" : "#f9f9f9",
              color: darkMode ? "white" : "black",
              border: "1px dashed #646cff00"
            }}
          >
            <div>
              <Paragraph
                className="text-sm font-semibold uppercase"
                style={{ color: darkMode ? "#9ba0ffff" : "#646cff" }}>
                New Project
              </Paragraph>
              <div className="mt-1 text-lg font-bold">
                Create a new project
              </div>
              <Paragraph className="mt-2 text-sm">
                Start a fresh workspace for your team’s code. You’ll be taken
                straight to the editor once it’s created.
              </Paragraph>
            </div>
            <Paragraph
              className="mt-3 text-sm font-medium"
              style={{ color: darkMode ? "#9ba0ffff" : "#646cff" }}>
              + Create Project
            </Paragraph>
          </Button>

          {/* open editor */}
          <Button
            onClick={goToEditor}
            className="flex flex-col items-start justify-between rounded-xl p-4 text-left hover:shadow-md transition-shadow"
            style={{
              backgroundColor: darkMode ? "#384153" : "#f9f9f9",
              color: darkMode ? "white" : "black",
              border: "1px solid #646cff00"
            }}
          >
            <div>
              <Paragraph
                className="text-sm font-semibold uppercase"
                style={{ color: darkMode ? "#9ba0ffff" : "#646cff" }}>
                Projects
              </Paragraph>
              <div className="mt-1 text-lg font-bold">
                Open a project
              </div>
              <Paragraph className="mt-2 text-sm">
                View your existing projects or create a new one to begin coding.
              </Paragraph>
            </div>
            <Paragraph
              className="mt-3 text-sm font-medium"
              style={{ color: darkMode ? "#9ba0ffff" : "#646cff" }}>
              → Go to Projects
            </Paragraph>
          </Button>

          {/* go to teams */}
          <Button
            onClick={goToTeams}
            className="flex flex-col items-start justify-between rounded-xl p-4 text-left hover:shadow-md transition-shadow"
            style={{
              backgroundColor: darkMode ? "#384153" : "#f9f9f9",
              color: darkMode ? "white" : "black",
              border: "1px solid #646cff00"
            }}
          >
            <div>
              <Paragraph
                className="text-sm font-semibold uppercase"
                style={{ color: darkMode ? "#9ba0ffff" : "#646cff" }}>
                Collaboration
              </Paragraph>
              <div className="mt-1 text-lg font-bold">
                Manage your teams
              </div>
              <Paragraph className="mt-2 text-sm">
                Search for existing teams, create a new one, or join your
                classmates and coworkers for group projects.
              </Paragraph>
            </div>
            <Paragraph
              className="mt-3 text-sm font-medium"
              style={{ color: darkMode ? "#9ba0ffff" : "#646cff" }}>
              → Go to Teams
            </Paragraph>
          </Button>
        </div>
      </Section>

      {/* How to use CodeLink */}
        <Section className="space-y-3" style={{ "boxShadow": "none" }}>
          <Heading level={2}>
            How to use CodeLink
          </Heading>
        <ol className={"list-decimal list-inside space-y-2 text-sm md:text-base " + (darkMode ? "text-gray-100" : "text-gray-800")}>
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
      </Section>

      {/* footer */}
      <section className={"text-xs " + (darkMode ? "text-gray-100" : "text-gray-800")}>
        Tip: You can always come back to this homepage via the{" "}
        <span className="font-semibold">Home</span> tab in the top navigation.
      </section>
    </Section>
  );
}
