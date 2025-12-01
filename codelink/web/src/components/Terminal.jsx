import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { io } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";

export default function Term() {
  const box = useRef(null);

  useEffect(() => {
    if (!box.current) return;

    const term = new Terminal({ convertEol: true });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(box.current);
    fit.fit();

    const socket = io("http://localhost:4000/pty");
    term.onData((d) => socket.emit("data", d));
    socket.on("data", (d) => term.write(d));

    window.codelinkTermWrite = (text) => {
      if (typeof text !== "string") {
        text = String(text);
      }
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
      delete window.codelinkTermWrite;
      delete window.codelinkTermClear;
    };
  }, []);

  return <div className="h-72 w-full border rounded-lg" ref={box} />;
}
