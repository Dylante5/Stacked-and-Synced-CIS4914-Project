import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) navigate("/app");
  }, [navigate]);

  return (
    <section className="flex flex-col items-center justify-center h-screen w-full text-center bg-gray-50">
      <h1 className="text-5xl font-extrabold">Welcome to CodeLink</h1>
      <p className="mt-4 text-gray-600 text-lg">
        Please log in to continue.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="mt-8 px-8 py-3 rounded-lg bg-black text-white hover:bg-gray-800"
      >
        Log in / Create account
      </button>

      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => navigate("/app")}
      />
    </section>
  );
}
