import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import * as monaco from "monaco-editor";
import Editor from "../components/Editor";
import Term from "../components/Terminal";
import { Download, Upload } from "../functions/EditorFunctions";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function addChild(nodes, parentId, child) {
  if (parentId === null || parentId === undefined || parentId === -1) {
    return [...nodes, child];
  }

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
    if (node.parent === -1 || node.parent === null || node.parent === undefined) {
      roots.push(node);
    } else {
      const parent = nodesById.get(node.parent);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  files.forEach((f) => {
    const fileNode = {
      id: f.id,
      name: f.name,
      type: "file",
      parent: f.parent,
    };

    if (f.parent === -1 || f.parent === null || f.parent === undefined) {
      roots.push(fileNode);
    } else {
      const parent = nodesById.get(f.parent);
      if (parent) {
        parent.children.push(fileNode);
      } else {
        roots.push(fileNode);
      }
    }
  });

  return roots;
}

// file/folder component
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

// main component
export default function EditorPage() {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const projectIdParam = searchParams.get("projectId");
	const projectId = projectIdParam ? Number(projectIdParam) : null;

	const [tree, setTree] = useState([]);

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
		  console.error("createfile failed:", data);
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
		  console.error("createfolder failed:", data);
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

	const handleRename = async (id, type) => {
		const newName = prompt("New name?");
		if (!newName) return;

		const endpoint =
		  type === "folder"
			? `${API_BASE}/api/fs/renamefolder/${id}`
			: `${API_BASE}/api/fs/renamefile/${id}`;

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
		  setTree((prev) => renameNode(prev, id, newName));
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
		  } catch (_) {}
		  alert("Failed to delete: " + (data.error || res.statusText));
		  return;
		}

		setTree((prev) => deleteNode(prev, node.id));
	  } catch (err) {
		console.error("Failed to delete:", err);
		alert("Network error deleting item");
	  }
	};

	const handleSelect = (node) => {
	console.log("Selected:", node);
	// TODO: load the file content into monaco when backend endpoint exists
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
		  <aside className="w-60 border-r border-gray-300 bg-white flex flex-col">
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
