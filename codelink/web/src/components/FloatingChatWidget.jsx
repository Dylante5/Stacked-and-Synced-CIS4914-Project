import { useState, useRef, useEffect } from "react";
import MiniChatWindow from "./MiniChatWindow";

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);

  const CHAT_WIDTH = 320;
  const CHAT_HEIGHT = 480;
  const MARGIN = 24;

  const [pos, setPos] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    setPos({
      x: w - CHAT_WIDTH - MARGIN,
      y: h - CHAT_HEIGHT - MARGIN,
    });
  }, []);

  // drag start
  const handleMouseDown = (e) => {
    dragging.current = true;
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  // drag move
  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  // drag stop
  const handleMouseUp = () => {
    dragging.current = false;
  };

  return (
    <>
      {/* Collapsed Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Team Chat</span>
        </button>
      )}

      {/* Draggable Chat Window */}
      {open && (
        <div
          className="fixed z-[9999] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl select-none"
          style={{
            width: `${CHAT_WIDTH}px`,
            maxHeight: `${CHAT_HEIGHT}px`,
            top: pos.y,
            left: pos.x,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header with drag handle */}
          <div
            className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-sm text-white"
            onMouseDown={(e) => {
              if (e.target.dataset?.role !== "close-btn") {
                handleMouseDown(e);
              }
            }}
            style={{ cursor: dragging.current ? "grabbing" : "grab" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                TC
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold">Team Chat</span>
                <span className="text-[11px] text-white/80">
                  Drag to move
                </span>
              </div>
            </div>

            <button
              data-role="close-btn"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              ×
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 bg-slate-50 px-3 py-2">
            <MiniChatWindow />
          </div>
        </div>
      )}
    </>
  );
}
