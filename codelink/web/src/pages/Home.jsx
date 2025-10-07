import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-gray-50">
      <section className="text-center">
        <h1 className="text-6xl font-extrabold">Welcome to CodeLink</h1>
        <p className="mt-4 text-gray-600 text-lg">
          A fast, collaborative development environment.
        </p>
        <Link
          to="/app"
          className="mt-8 inline-block px-8 py-4 rounded-lg bg-black text-white hover:bg-gray-800"
        >
          Open the App
        </Link>
      </section>
    </div>
  );
}


