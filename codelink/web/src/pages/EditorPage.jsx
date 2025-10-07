import Editor from "../components/Editor";
import Term from "../components/Terminal";

export default function EditorPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 h-[80vh] w-screen" style={{ width: "100%"}}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 font-semibold app-header">Editor</div>
        <div className="flex-1"><Editor /></div>
      </div>

      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 font-semibold app-header">Terminal</div>
        <div className="flex-1"><Term /></div>
      </div>
    </div>
  );
}
