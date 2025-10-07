import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { io } from "socket.io-client";

export default function Editor({ docId = "demo.js" }) {
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) return;
    const editor = monaco.editor.create(divRef.current, {
      value: `// Start typing...\n`,
      language: "javascript",
      automaticLayout: true,
    });

    const socket = io("http://localhost:4000/docs");
    socket.emit("join", docId);

    const sub = editor.onDidChangeModelContent(() => {
      socket.emit("op", { value: editor.getValue() });
    });

    socket.on("op", ({ value }) => {
      if (editor.getValue() !== value) editor.setValue(value);
    });

    return () => { sub.dispose(); editor.dispose(); socket.close(); };
  }, [docId]);

  return <div className="h-full w-full" ref={divRef} />;
}