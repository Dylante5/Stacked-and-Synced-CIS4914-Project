import { useState } from "react";
import MiniChatWindow from "./MiniChatWindow";

// Right-bottom floating chat widget
export default function FloatingChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 px-4 py-2 rounded text-white"
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

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 bg-white rounded-lg border p-3"
          style={{
            width: "20rem", 
            height: "auto", 
            maxHeight: "30rem" ,
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {/* header */}
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-black">Team Chat</div>

            <button
              className="px-2 py-1 rounded text-white"
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
          <MiniChatWindow />
        </div>
      )}
    </>
  );
}
