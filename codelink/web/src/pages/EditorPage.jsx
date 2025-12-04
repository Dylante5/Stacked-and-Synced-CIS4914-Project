import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import CodeEditor from "../components/Editor";
import Term from "../components/Terminal";
import { Download, Upload } from "../functions/EditorFunctions";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function addChild(nodes, parentId, child) {
  if (parentId === null || parentId === undefined || parentId === -1) {
    return [...nodes, child];
  }
  return nodes.map((node) => {
    if (node.id === parentId && node.type === "folder") {
      return { ...node, children: [...(node.children || []), child] };
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

function buildTree(folders, files) {
  const nodesById = new Map();
  const roots = [];

  folders.forEach((f) => {
    nodesById.set(f.id, {
      id: f.id,
      name: f.name,
      type: "folder",
      parent: f.parent,
      children: [],
    });
  });

  nodesById.forEach((node) => {
    if (node.parent === -1 || node.parent == null) {
      roots.push(node);
    } else {
      const parent = nodesById.get(node.parent);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  });

  files.forEach((f) => {
    const fileNode = {
      id: f.id,
      name: f.name,
      type: "file",
      parent: f.parent,
    };
    if (f.parent === -1 || f.parent == null) {
      roots.push(fileNode);
    } else {
      const parent = nodesById.get(f.parent);
      if (parent) parent.children.push(fileNode);
      else roots.push(fileNode);
    }
  });

  return roots;
}

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
                onRename(node);
              }}
            >
              ✏
            </span>
            <span
              className="cursor-pointer text-red-500 hover:text-red-700"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
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
              onRename(node);
            }}
          >
            ✏
          </span>
          <span
            className="cursor-pointer text-red-500 hover:text-red-700"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
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
  const [editor, setEditor] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectIdParam = searchParams.get("projectId");
  const projectId = projectIdParam ? Number(projectIdParam) : null;

  const [tree, setTree] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const saveTimeoutRef = useRef(null);

  const runMyCode = async () => {
    if (!editor) {
      alert("Editor is not ready.");
      return;
    }

	  const code = editor.getValue();

	  try {
		const res = await fetch(`${API_BASE}/api/run/my`, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ code }),
		});

		const data = await res.json();

		if (!res.ok) {
		  const message = data.error || res.statusText;
		  if (window.codelinkTermWrite) {
			window.codelinkTermWrite(
			  `\r\n[Run My Code FAILED]\r\n${message}\r\n\r\n`
			);
		  } else {
			alert("Run failed: " + message);
		  }
		  return;
		}

		const { stdout, stderr, exitCode } = data;

		const write = window.codelinkTermWrite;
		if (write) {
		  write("\r\n[Run My Code]\r\n");
		  if (stdout) {
			write(stdout.endsWith("\n") ? stdout : stdout + "\r\n");
		  }
		  if (stderr) {
			write("\r\n[stderr]\r\n");
			write(stderr.endsWith("\n") ? stderr : stderr + "\r\n");
		  }
		  write(`\r\n[exitCode ${exitCode}]\r\n`);
		} else {
		  alert(
			(stderr ? `stderr:\n${stderr}\n\n` : "") +
			  `stdout:\n${stdout || "(no output)"}\nexitCode: ${exitCode}`
		  );
		}
	  } catch (err) {
		console.error("Run my code error:", err);
		if (window.codelinkTermWrite) {
		  window.codelinkTermWrite(
			`\r\n[Run My Code ERROR]\r\nNetwork error running code\r\n\r\n`
		  );
		} else {
		  alert("Network error running code");
		}
	  }
  };

  const runSharedCode = () => {
    alert("(placeholder)");
  };

  useEffect(() => {
    if (!projectId) return;

    async function loadTree() {
      try {
        const [foldersRes, filesRes] = await Promise.all([
          fetch(`${API_BASE}/api/fs/getfolders/${projectId}`),
          fetch(`${API_BASE}/api/fs/getfiles/${projectId}`),
        ]);

        const foldersJson = await foldersRes.json();
        const filesJson = await filesRes.json();

        const folders = Array.isArray(foldersJson)
          ? foldersJson
          : foldersJson.projects || [];
        const files = Array.isArray(filesJson)
          ? filesJson
          : filesJson.projects || [];

        setTree(buildTree(folders, files));
      } catch (err) {
        console.error("Failed to load filesystem", err);
      }
    }

    loadTree();
  }, [projectId]);

  const handleSave = async (isAuto = false) => {
    if (!activeFile) {
      if (!isAuto) alert("No file selected");
      return;
    }

    if (!editor) return;

    const content = editor.getValue();

    try {
      const res = await fetch(`${API_BASE}/api/fs/file/${activeFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to save file:", data);
        if (!isAuto) {
          alert("Failed to save file: " + (data.error || res.statusText));
        }
        return;
      }
      console.log(isAuto ? "Autosave OK" : "Manual save OK", data);
    } catch (err) {
      console.error("Failed to save file:", err);
      if (!isAuto) alert("Network error saving file");
    }
  };

  const scheduleAutoSave = () => {
    if (!activeFile) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
  };

  useEffect(() => {
    if (!editor) return;

    const disposable = editor.onDidChangeModelContent(() => {
      scheduleAutoSave();
    });

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      disposable.dispose();
    };
  }, [activeFile, editor]);

  const handleAddFile = async (parentId = -1) => {
    const name = prompt("File name?");
    if (!name || !projectId) return;

    try {
      const res = await fetch(`${API_BASE}/api/fs/createfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, project_id: projectId, parent: parentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Failed to create file: " + (data.error || res.statusText));
        return;
      }
      const created = data;
      setTree((prev) =>
        addChild(prev, created.parent ?? -1, {
          id: created.id,
          name: created.name,
          type: "file",
        })
      );
    } catch (err) {
      console.error("Failed to create file:", err);
      alert("Network error creating file");
    }
  };

  const handleAddFolder = async (parentId = -1) => {
    const name = prompt("Folder name?");
    if (!name || !projectId) return;

    try {
      const res = await fetch(`${API_BASE}/api/fs/createfolder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, project_id: projectId, parent: parentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Failed to create folder: " + (data.error || res.statusText));
        return;
      }
      const created = data;
      setTree((prev) =>
        addChild(prev, created.parent ?? -1, {
          id: created.id,
          name: created.name,
          type: "folder",
          children: [],
        })
      );
    } catch (err) {
      console.error("Failed to create folder:", err);
      alert("Network error creating folder");
    }
  };

  const handleRename = async (node) => {
    const newName = prompt("New name?", node.name);
    if (!newName || newName === node.name) return;

    const isFolder = node.type === "folder";
    const endpoint = isFolder
      ? `${API_BASE}/api/fs/renamefolder/${node.id}`
      : `${API_BASE}/api/fs/renamefile/${node.id}`;

    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Failed to rename: " + (data.error || res.statusText));
        return;
      }
      setTree((prev) => renameNode(prev, node.id, newName));
      if (activeFile && activeFile.id === node.id) {
        setActiveFile({ ...activeFile, name: newName });
      }
    } catch (err) {
      console.error("Failed to rename:", err);
      alert("Network error renaming item");
    }
  };

  const handleDelete = async (node) => {
    if (!window.confirm("Delete this item?")) return;

    const isFolder = node.type === "folder";
    const endpoint = isFolder
      ? `${API_BASE}/api/fs/deletefolder/${node.id}`
      : `${API_BASE}/api/fs/deletefile/${node.id}`;

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        let data = {};
        try {
          data = await res.json();
        } catch (_) { }
        alert("Failed to delete: " + (data.error || res.statusText));
        return;
      }
      setTree((prev) => deleteNode(prev, node.id));
      if (activeFile && activeFile.id === node.id) {
        setActiveFile(null);
        if (editor) editor.setValue("");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Network error deleting item");
    }
  };

  const handleSelect = async (node) => {
    if (node.type !== "file") return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      const res = await fetch(`${API_BASE}/api/fs/file/${node.id}`);
      const data = await res.json();

      if (!res.ok) {
        alert("Failed to load file: " + (data.error || res.statusText));
        return;
      }

      if (editor) {
        editor.setValue(data.content || "");
      }

      setActiveFile({ id: data.id, name: data.name });
    } catch (err) {
      console.error("Failed to load file:", err);
      alert("Network error loading file");
    }
  };

  if (!projectId) {
    return (
      <div className="p-4">
        No project selected (missing <code>?projectId=</code> in URL).
      </div>
    );
  }

  return (
    <div className="flex w-full h-[80vh]">
      <aside className="w-60 border-r border-gray-300 bg-white flex flex-col" style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>
        <div className="px-3 py-2 font-semibold text-sm text-gray-700 border-b">
          Files
        </div>

        <div className="px-3 py-2 flex items-center justify-between text-[11px] border-b bg-gray-50">
          <span className="uppercase tracking-wide text-gray-500">Root</span>
          <div className="flex gap-2 text-gray-600">
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={() => handleAddFile(-1)}
            >
              + File
            </span>
            <span
              className="cursor-pointer hover:text-gray-900"
              onClick={() => handleAddFolder(-1)}
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
        <div className="grid gap-4 md:grid-cols-2 h-full w-full max-w-7xl px-4">
          <div className="flex flex-col border overflow-hidden border-gray-300 bg-white" style={{ boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)" }}>
            <div className="p-2 font-semibold app-header mx-auto flex items-center gap-2">
              <span>Editor</span>
              {activeFile && (
                <span className="text-xs text-gray-500">
                  ({activeFile.name})
                </span>
              )}
              {activeFile && (
                <div className="flex justify-center">
                  <button
                    className="relative inline-flex items-center justify-center me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-2"
                    onClick={runMyCode}
                  >
                    Run
                  </button>
				  
				  
                  { /* Stretch Goal -
				  <button
                    className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-2"
                    onClick={runSharedCode}
                  >
                    Run Shared Code
                  </button> */ }
				  
                  <button
                    className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-700 mx-2"
                    onClick={() => editor && Download(editor.getValue(), activeFile.name)}
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
              )}
            </div>
            <div className="flex-1 relative border-t border-black">
              {activeFile ? (
                <CodeEditor onEditorMount={setEditor} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <h2 className="text-xl font-semibold mb-2">No File Selected</h2>
                    <p className="text-sm">Choose a file from the sidebar to begin editing.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex-1">
              <Term />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
