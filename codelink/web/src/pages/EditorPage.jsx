import * as monaco from "monaco-editor";
import Editor from "../components/Editor";
import Term from "../components/Terminal";
import FileTree from "../components/FileTree"
import { Download, Upload } from "../functions/EditorFunctions";

export default function EditorPage() {
  return (
    <div className="flex w-full h-[80vh]">
      <aside className="w-[10%] min-w-[160px] border-r border-gray-300 dark:border-gray-700 flex flex-col">
        <div className="p-3 font-semibold app-header">
          Files
        </div>

        <div className="px-3 pb-3 text-sm overflow-y-auto">
          {/* placeholder dropdown folder structure */}
          <details open className="mb-2">
            <summary className="cursor-pointer font-medium">
              project-1/
            </summary>
            <ul className="mt-1 pl-4 space-y-1 text-xs">
              <li>src/</li>
              <li>public/</li>
              <li>README.md</li>
            </ul>
          </details>

          <details className="mb-2">
            <summary className="cursor-pointer font-medium">
              project-2/
            </summary>
            <ul className="mt-1 pl-4 space-y-1 text-xs">
              <li>main.py</li>
              <li>requirements.txt</li>
            </ul>
          </details>

          <details>
            <summary className="cursor-pointer font-medium">
              shared-utils/
            </summary>
            <ul className="mt-1 pl-4 space-y-1 text-xs">
              <li>helpers.js</li>
              <li>config.json</li>
            </ul>
          </details>
        </div>
      </aside>

      <div className="flex-1 flex justify-center">
        <div className="grid gap-4 md:grid-cols-2 h-full w-full max-w-5xl px-4">
          {/* EDITOR PANEL */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="p-2 font-semibold app-header mx-5">
              Editor
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-91"
                onClick={() =>
                  eval(monaco.editor.getEditors()[0].getValue())
                }
              >
                Run
              </button>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-5"
                onClick={() =>
                  Download(monaco.editor.getEditors()[0].getValue())
                }
              >
                Download
              </button>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-5"
                onClick={() => Upload()}
              >
                Upload
              </button>
            </div>
            <div className="flex-1">
              <Editor />
            </div>
          </div>

          {/* TERMINAL PANEL */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="p-2 font-semibold app-header mx-5">
              Terminal
            </div>
            <div className="flex-1">
              <Term />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}