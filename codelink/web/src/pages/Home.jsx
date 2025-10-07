import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center h-screen w-screen text-center bg-gray-50">
      <h1 className="text-6xl font-extrabold">Welcome to CodeLink</h1>
      <p className="mt-4 text-gray-600 text-lg">
        A fast, collaborative development environment.
      </p>
      <Link
        to="/app"
        className="mt-8 px-8 py-4 rounded-lg bg-black text-white hover:bg-gray-800"
      >
        Open the App
      </Link>
    </section>
  );
}
