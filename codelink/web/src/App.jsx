import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold">CodeLink</Link>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/app" className="hover:underline">App</Link>
          </nav>
        </div>
      </header>

      <main className={`p-6 ${location.pathname === '/app' ? 'max-w-none' : 'max-w-6xl mx-auto'}`}>
        <Outlet /> {/* pages render here */}
      </main>

      <footer className="text-center text-sm text-gray-500 p-6">CodeLink</footer>
    </div>
  );
}
