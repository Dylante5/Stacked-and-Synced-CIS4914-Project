import Editor from "./components/Editor";
import Term from "./components/Terminal";

export default function App() {
  return (
    <div className="p-4 grid gap-4 md:grid-cols-2 h-screen box-border">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold mb-2">CodeLink — Editor</h1>
          <div className="flex-1 border rounded-lg overflow-hidden">
            <Editor />
          </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Terminal</h2>
        <Term />
      </div>
    </div>
  );
}