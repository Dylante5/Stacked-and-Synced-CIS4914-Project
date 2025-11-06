import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const onCreate = () => {
      var name = prompt("Please enter a name for your project");
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

function ProjectButton(name) {
    return <button
        style={{
            color: "fff",
            borderRadius: "8px",
            background: "#646cff",
            padding: "0.4em 1em",
            fontWeight: 500,
            cursor: "pointer",
            height: 140
        }}>name</button>
}
