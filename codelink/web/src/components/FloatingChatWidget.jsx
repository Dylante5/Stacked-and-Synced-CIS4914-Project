import { useState, useRef, useEffect } from "react";
import MiniChatWindow from "./MiniChatWindow";

export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);

  // Chatbox dimensions
  const CHAT_WIDTH = 320;    
  const CHAT_HEIGHT = 480;   
  const MARGIN = 24;        

  // Draggable position
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Set initial position at bottom-right
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    setPos({
      x: w - CHAT_WIDTH - MARGIN,
      y: h - CHAT_HEIGHT - MARGIN,
    });
  }, []);

  // Drag start
  const handleMouseDown = (e) => {
    dragging.current = true;
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  // Drag move
  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  // Drag stop
  const handleMouseUp = () => {
    dragging.current = false;
  };

  return (
    <>
      {/* Collapsed Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-2 rounded text-white"
          style={{ backgroundColor: "#646cff" }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#535bf2")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#646cff")
          }
        >
          Chat
        </button>
      )}

      {/* Draggable Chat Window */}
      {open && (
        <div
          className="fixed bg-white rounded-lg border select-none"
          style={{
            width: `${CHAT_WIDTH}px`,
            maxHeight: `${CHAT_HEIGHT}px`,
            overflow: "hidden",
            top: pos.y,
            left: pos.x,
            zIndex: 9999,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header with drag handle */}
          
        <div
          className="flex justify-between items-center h-10 px-3 border-b bg-gray-100 select-none"
          onMouseDown={(e) => {
            if (e.target.dataset?.role !== "close-btn") {
              handleMouseDown(e);
            }
          }}
          style={{ cursor: dragging.current ? "grabbing" : "grab" }}
          >
            <span className="font-semibold text-black">
              Team Chat
            </span>
            
            <button
            data-role="close-btn"
            className="px-3 py-1 rounded text-white"
            style={{ backgroundColor: "#646cff" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#535bf2")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#646cff")
            }
            onClick={() => setOpen(false)}
            >
              X
              </button>
        </div>


          {/* Chat Content */}
          <div className="p-3">
            <MiniChatWindow />
          </div>
        </div>
      )}
    </>
  );
}
