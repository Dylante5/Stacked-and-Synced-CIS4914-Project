import * as monaco from "monaco-editor";
import Editor from "../components/Editor";
import Term from "../components/Terminal";
import { Download, Upload } from "../Functions/FileFunctions";

export default function EditorPage() {
    return (
    <div className="grid gap-4 md:grid-cols-2 h-[80vh] w-screen" style={{ width: "100%"}}>
      <div className="flex flex-col border rounded-lg overflow-hidden" style={{ boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)" }}>
              <div className="p-2 font-semibold app-header mx-5">Editor
                  <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-91"
                      onClick={() => eval(monaco.editor.getEditors()[0].getValue())}>
                      Run
                  </button>
                    <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-5"
                        onClick={() => Download(monaco.editor.getEditors()[0].getValue())}>
                        Download
                    </button>
                    <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-5"
                        onClick={ () => Upload()}>
                        Upload
                    </button>
              </div>
        <div className="flex-1"><Editor /></div>
      </div>
        
      <div className="flex flex-col border rounded-lg overflow-hidden" style={{ boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)" }}>
        <div className="p-2 font-semibold app-header mx-5">Terminal</div>
        <div className="flex-1"><Term /></div>
      </div>
    </div>
  );
}
