import React, { useState } from "react";
import { useSelector } from "react-redux";
import { emitPostDoubt, emitUpvoteDoubt } from "../socketConn/socketConn";

const DoubtsPanel = ({ roomID, role }) => {
  const doubts = useSelector((state) => state.whiteboard.doubts);
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Track which doubts the user has already upvoted
  const [upvotedDoubts, setUpvotedDoubts] = useState({});

  const handleUpvote = (roomID, id) => {
    if (upvotedDoubts[id]) return; // already upvoted, do nothing

    emitUpvoteDoubt(roomID, id);
    setUpvotedDoubts((prev) => ({ ...prev, [id]: true }));
  };

  const handlePost = () => {
    if (text.trim()) {
      emitPostDoubt(roomID, text.trim());
      setText("");
    }
  };

  return (
    <div style={{ position: "fixed", top: "20px", right: `${role === 'teacher' ? "380px" : "240px"}`, zIndex: 1000 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "10px 20px",
          borderRadius: "30px",
          backgroundColor: "#4f46e5",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        {isOpen ? "Close Doubts" : "Open Doubts"}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "10px",
            width: "300px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "15px",
            boxShadow: "0px 10px 15px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Doubts</h3>

          {role === "student" && <div style={{ display: "flex", marginBottom: "10px" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your doubt..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={handlePost}
              style={{
                marginLeft: "5px",
                padding: "8px 12px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#10b981",
                color: "white",
                cursor: "pointer",
              }}
            >
              Post
            </button>
          </div>}

          <ul style={{ listStyle: "none", padding: 0 }}>
            {doubts.map((d) => (
              <li
                key={d.id}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  borderRadius: "5px",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {d.doubt} - Votes: {d.votes}
                </span>
                <button
                  onClick={() => handleUpvote(roomID, d.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: `${upvotedDoubts[d.id] ? "#0d3b84ff" : "#5d92e8ff"}`,
                    color: "white",
                    cursor: upvotedDoubts[d.id] ? "not-allowed" : "pointer",
                  }}
                  disabled={upvotedDoubts[d.id]}
                >
                  +1
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoubtsPanel;
