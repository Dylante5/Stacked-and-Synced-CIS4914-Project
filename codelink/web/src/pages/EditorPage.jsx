import React, { useState } from "react";
import * as monaco from "monaco-editor";
import Editor from "../components/Editor";
import Term from "../components/Terminal";
import FileTree from "../components/FileTree"
import { Download, Upload } from "../functions/EditorFunctions";

const initialTree = [
  {
    id: "project-1",
    name: "project-1",
    type: "folder",
    children: [
      { id: "p1-src", name: "src", type: "folder", children: [] },
      { id: "p1-public", name: "public", type: "folder", children: [] },
      { id: "p1-readme", name: "README.md", type: "file" },
    ],
  },
  {
    id: "project-2",
    name: "project-2",
    type: "folder",
    children: [
      { id: "p2-main", name: "main.py", type: "file" },
      { id: "p2-req", name: "requirements.txt", type: "file" },
    ],
  },
];

// tree helpers 
function addChild(nodes, parentId, child) {
  if (!parentId) return [...nodes, child];

  return nodes.map((node) => {
    if (node.id === parentId && node.type === "folder") {
      return {
        ...node,
        children: [...(node.children || []), child],
      };
    }
    if (node.children) {
      return { ...node, children: addChild(node.children, parentId, child) };
    }
    return node;
  });
}

function renameNode(nodes, id, newName) {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, name: newName };
    if (node.children) {
      return { ...node, children: renameNode(node.children, id, newName) };
    }
    return node;
  });
}

function deleteNode(nodes, id) {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children ? { ...node, children: deleteNode(node.children, id) } : node
    );
}

// file/folder component (unstyled buttons)
function FileNode({ node, onAddFile, onAddFolder, onRename, onDelete, onSelect }) {
  const isFolder = node.type === "folder";

  if (isFolder) {
    return (
      <li className="mb-1">
        <div className="flex items-center justify-between text-xs">
          <div
            className="flex items-center gap-1 cursor-pointer rounded px-1 py-0.5 hover:bg-gray-100"
            onClick={() => onSelect(node)}
          >
            <span>📁</span>
            <span className="truncate">{node.name}</span>
          </div>
          <div className="flex gap-1 ml-2 text-[10px] text-gray-500">
            <span
              className="cursor-pointer hover:text-gray-900"
              title="Add file"
              onClick={(e) => {
                e.stopPropagation();
                onAddFile(node.id);
              }}
            >
              +F
            </span>
            <span
              className="cursor-pointer hover:text-gray-900"
              title="Add folder"
              onClick={(e) => {
                e.stopPropagation();
                onAddFolder(node.id);
              }}
            >
              +D
            </span>
            <span
              className="cursor-pointer hover:text-gray-900"
              title="Rename"
              onClick={(e) => {
                e.stopPropagation();
                onRename(node.id);
              }}
            >
              ✏
            </span>
            <span
              className="cursor-pointer text-red-500 hover:text-red-700"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
            >
              🗑
            </span>
          </div>
        </div>

        <ul className="mt-1 ml-3 pl-2 border-l border-gray-200">
          {(node.children || []).map((child) => (
            <FileNode
              key={child.id}
              node={child}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onRename={onRename}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className="mb-1">
      <div className="flex items-center justify-between text-xs">
        <div
          className="flex items-center gap-1 cursor-pointer rounded px-1 py-0.5 hover:bg-gray-100"
          onClick={() => onSelect(node)}
        >
          <span>📄</span>
          <span className="truncate">{node.name}</span>
        </div>
        <div className="flex gap-1 ml-2 text-[10px] text-gray-500">
          <span
            className="cursor-pointer hover:text-gray-900"
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              onRename(node.id);
            }}
          >
            ✏
          </span>
          <span
            className="cursor-pointer text-red-500 hover:text-red-700"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            🗑
          </span>
        </div>
      </div>
    </li>
  );
}

export default function EditorPage() {
  const [tree, setTree] = useState(initialTree);

  const handleAddFile = (parentId = null) => {
    const name = prompt("File name?");
    if (!name) return;
    const id = "file-" + Date.now() + Math.random().toString(36).slice(2);
    setTree((prev) => addChild(prev, parentId, { id, name, type: "file" }));
  };

  const handleAddFolder = (parentId = null) => {
    const name = prompt("Folder name?");
    if (!name) return;
    const id = "folder-" + Date.now() + Math.random().toString(36).slice(2);
    setTree((prev) =>
      addChild(prev, parentId, { id, name, type: "folder", children: [] })
    );
  };

  const handleRename = (id) => {
    const name = prompt("New name?");
    if (!name) return;
    setTree((prev) => renameNode(prev, id, name));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this item?")) return;
    setTree((prev) => deleteNode(prev, id));
  };

  const handleSelect = (node) => {
    // load file into monaco here (later)
    console.log("Selected:", node);
  };

  return (
    <div className="flex w-full h-[80vh]">
      <aside className="w-60 border-r border-gray-300 bg-white flex flex-col">
        <div className="px-3 py-2 font-semibold text-sm text-gray-700 border-b">
          Files
        </div>

        <div className="px-3 py-2 flex items-center justify-between text-[11px] border-b bg-gray-50">
          <span className="uppercase tracking-wide text-gray-500">Root</span>
          <div className="flex gap-2 text-gray-600">
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={() => handleAddFolder(null)}
            >
              + Folder
            </span>
          </div>
        </div>

        <div className="px-3 py-2 text-xs overflow-y-auto">
          <ul>
            {tree.map((node) => (
              <FileNode
                key={node.id}
                node={node}
                onAddFile={handleAddFile}
                onAddFolder={handleAddFolder}
                onRename={handleRename}
                onDelete={handleDelete}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 flex justify-center">
        <div className="grid gap-4 md:grid-cols-2 h-full w-full max-w-5xl px-4">
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="p-2 font-semibold app-header mx-5">
              Editor
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-2"
                onClick={() =>
                  eval(monaco.editor.getEditors()[0].getValue())
                }
              >
                Run
              </button>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-2"
                onClick={() =>
                  Download(monaco.editor.getEditors()[0].getValue())
                }
              >
                Download
              </button>
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-2"
                onClick={() => Upload()}
              >
                Upload
              </button>
            </div>
            <div className="flex-1">
              <Editor />
            </div>
          </div>
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