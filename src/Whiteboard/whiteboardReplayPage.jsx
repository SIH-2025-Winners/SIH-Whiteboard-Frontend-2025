import React, { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import WhiteboardReplay from "./WhiteboardReplay";

const WhiteboardReplayPage = () => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 Example: URL me classId pass kare /replay?classId=123
  const params = new URLSearchParams(window.location.search);

  const classIdParam = params.get("classId");
  console.log("URL Params:", classIdParam);

  useLayoutEffect(() => {
    const fetchClassData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://sih-whiteboard-backend-socket-2025.onrender.com/api/classes/${classIdParam}`
        );
        setClassData(res.data);
        console.log("Class data loaded:", res.data);
      } catch (err) {
        console.error("Error loading class:", err);
      }
      setLoading(false);
    };

    fetchClassData();
  }, [classIdParam]);

  if (loading)
    return (
      <div style={{ padding: 50, fontSize: 22, fontWeight: "bold" }}>
        Loading Replay...
      </div>
    );

  if (!classData)
    return (
      <div
        style={{ padding: 50, fontSize: 22, fontWeight: "bold", color: "red" }}
      >
        Failed to load class.
      </div>
    );

  return <WhiteboardReplay classData={classData} />;
};

export default WhiteboardReplayPage;
