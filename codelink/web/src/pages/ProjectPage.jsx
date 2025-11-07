import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [name, setName] = useState("");
    const [userid, setUserid] = useState("");
    const [err, setErr] = useState("");

    const navigate = useNavigate();
    const onCreate = async (e) => {
        e.preventDefault();
        setErr("");
        setName(prompt("Input New Project Name"));
        setUserid(localStorage.getItem("id"));
        try {
            const url = "/api/projectcreation/create";
            const payload =
                {name, userid}

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Request failed");

            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (e2) {
            setErr(e2.message);
        } 
      navigate("/app");
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
        </section>
    );
}


