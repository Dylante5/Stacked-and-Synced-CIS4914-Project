import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { MonacoBinding } from 'y-monaco';

import { useRef, useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';

import { io } from 'socket.io-client';

import "./Editor.css"

const user = JSON.parse(localStorage.getItem("user"));
const userName = user?.firstName;
//const teams = user.teams||[];

const docName = 'test';

const configuration = {
  gcEnabled: true,
  autoConnect: true,
  awareness: undefined,
  resyncInterval: -1,
  disableBc: false,
  auth: {}
}

// CSS content needs to be dynamically updated upon user join/leave
function UpdateUsers({ users }) {
  return (
    <style>
      {
        Array.from(users.keys()).map((user) => (
          `
        .cursor.${user}::after {
          content: "${user}";
        }
        `
        ))
      }
    </style>
  );
}

export default function CodeEditor({ onEditorMount }) {
  const [socket, setSocket] = useState(null);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState(null);
  const [binding, setBinding] = useState(null);
  const [users, setUsers] = useState(new Map());
  const [decorations, setDecorations] = useState(null);
  const [editor, setEditor] = useState(null);
  const [monaco, setMonaco] = useState(null);
  const colorIndex = useRef(-1);

  const generateColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

    colorIndex.current += 1;
    if (colorIndex.current > colors.length)
      colorIndex.current = 0;

    return colors[colorIndex.current];
  }

  const handleEditorDidMount = (editor, monaco) => {
    setEditor(editor);
    setMonaco(monaco);

    if (onEditorMount) onEditorMount(editor);

    const s = io('http://localhost:4000/editor');
    setSocket(s);

    s.emit('join', { docName, userName });

    s.on('joined', (userName) => {
      setUsers(oldUsers => {
        const newUsers = new Map(oldUsers);
        newUsers.set(userName, { position: {}, color: generateColor() });
        return newUsers;
      })
    });

    s.on("leave", (userName) => {
      setUsers(oldUsers => {
        const newUsers = new Map(oldUsers);
        newUsers.delete(userName);
        return newUsers;
      })
    });

    const decorationsCollection = editor.createDecorationsCollection([]);
    setDecorations(decorationsCollection);

    s.on('cursor-pos', ({ userName, position }) => {
      // range: (startLine, startCol, endLine, endCol)
      setUsers(oldUsers => {
        const newUsers = new Map(oldUsers);
        newUsers.set(userName, { position: position, color: oldUsers.get(userName)?.color || generateColor() });
        return newUsers;
      });
    });

    editor.onDidChangeCursorPosition((e) => {
      s.emit('cursor-pos', { docName, userName, position: e.position });
    });
  }

  // update indicators automatically
  useEffect(() => {
    if (!decorations || !editor || !monaco) return;

    setDecorations(oldDecorations => {
      oldDecorations.clear();
      for (const [user, props] of users) {
        const pos = props.position;
        const className = props.color + " cursor " + user;

        const range = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);

        oldDecorations.append([
          {
            options: {
              className: className,
            },
            range: range,
          }
        ]);
      }
      return oldDecorations;
    });
  }, [users]);

  // this effect manages the lifetime of the Yjs document and the provider
  useEffect(() => {
    const provider = new SocketIOProvider('ws://localhost:4000', docName, ydoc, configuration);
    setProvider(provider);

    return () => {
      provider?.destroy();
      ydoc.destroy();
    }
  }, [ydoc]);

  // this effect manages the lifetime of the editor binding
  useEffect(() => {
    if (!provider || !editor) return;

    const model = editor.getModel()
    if (!model) return;

    // binds the Yjs text to the Monaco model
    const binding = new MonacoBinding(ydoc.getText(), model, new Set([editor]), provider?.awareness);
    setBinding(binding);

    return () => {
      binding.destroy();
      socket.removeAllListeners();
      socket.emit("leave", { docName, userName });
      socket.disconnect();
    }
  }, [ydoc, provider, editor]);

  return (
    <div>
      <UpdateUsers users={users} />
      <Editor
        height="90vh"
        defaultValue="// Start typing..."
        defaultLanguage="javascript"
        onMount={handleEditorDidMount}
      />
    </div>
  );
}