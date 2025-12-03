import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { io } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";

export default function Term() {
  const box = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!box.current) return;

    const term = new Terminal({
      convertEol: true,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
      theme: {
        background: "#020617",
        foreground: "#e5e7eb",
        cursor: "#38bdf8",
        selectionBackground: "#1e293b",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(box.current);
    fit.fit();

    termRef.current = term;
    fitRef.current = fit;

    const socket = io("http://localhost:4000/pty");
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    term.onData((d) => socket.emit("data", d));
    socket.on("data", (d) => term.write(d));

    window.codelinkTermWrite = (text) => {
      if (typeof text !== "string") text = String(text);
      term.write(text);
    };
    window.codelinkTermClear = () => {
      term.clear();
    };

    const onResize = () => fit.fit();
    window.addEventListener("resize", onResize);

    return () => {
      socket.close();
      window.removeEventListener("resize", onResize);
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
      delete window.codelinkTermWrite;
      delete window.codelinkTermClear;
    };
  }, []);

  const handleClear = () => {
    if (termRef.current) {
      termRef.current.clear();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-700 bg-slate-950 shadow-inner overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/90 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span className="ml-2 font-medium tracking-wide text-slate-100">
            CodeLink Shell
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-400 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] px-2 py-1 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-500 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div ref={box} className="flex-1 text-[13px]" />
    </div>
  );
}