import React, { useEffect, useRef, useState } from "react";
import CursorOverlay from "../CursorOverlay/CursorOverlay";
import {
  connectWithSocketServer,
  emitDisconnecting,
  saveWhiteboardState,
} from "../socketConn/socketConn";
import Whiteboard from "./Whiteboard";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import { useDispatch } from "react-redux";
import {
  startRecording as startRecordingInStore,
  stopRecording as stopRecordingInStore,
} from "./whiteboardSlice";
import DraggableVideo from "../components/DraggableVideo";

const AUDIO_SERVER_URL = "http://localhost:3001";

// If your chunk-upload backend runs on a different origin, change this.
const UPLOAD_SERVER_URL = "http://localhost:3001";

// Socket.IO configuration with retry logic
const socketConfig = {
  timeout: 10000,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 5,
  maxReconnectionAttempts: 10,
  transports: ["websocket", "polling"],
  upgrade: true,
};

const peerConfig = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls: "turn:asia.relay.metered.ca:80",
      username: "72f03df1b6a58f38d7fd81ab",
      credential: "guctVzh/8qDU4KU0",
    },
    {
      urls: "turn:asia.relay.metered.ca:80?transport=tcp",
      username: "72f03df1b6a58f38d7fd81ab",
      credential: "guctVzh/8qDU4KU0",
    },
    {
      urls: "turn:asia.relay.metered.ca:443",
      username: "72f03df1b6a58f38d7fd81ab",
      credential: "guctVzh/8qDU4KU0",
    },
    {
      urls: "turns:asia.relay.metered.ca:443?transport=tcp",
      username: "72f03df1b6a58f38d7fd81ab",
      credential: "guctVzh/8qDU4KU0",
    },
  ],
};

function WhiteboardPage() {
  const location = useLocation();
  const data = location.state;
  const dispatch = useDispatch();
  console.log(`from min wb page ${JSON.stringify(data)}`);

  const audioSocketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [usernames, setUsernames] = useState({});
  const [roles, setRoles] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // --- Recording / mixing refs & state (from code 2)
  const audioContextRef = useRef(null);
  const destinationRef = useRef(null);
  const mixedStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingRef = useRef(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    connectWithSocketServer(data.roomID, data.userID);
    // eslint-disable-next-line
  }, [data.roomID, data.userID]);

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks?.()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
  };

  useEffect(() => {
    const joinRoom = async () => {
      try {
        console.log("🎤 Requesting microphone access...");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            sampleSize: 16,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: data.role === "teacher",
        });

        localStreamRef.current = stream;
        console.log("✅ Microphone access granted:", stream.getAudioTracks());
      } catch (error) {
        console.error("❌ Microphone access denied:", error);
        return;
      }

      // If teacher, prepare audio mixer (teacher uses mixedStream for recording)
      if (data.role === "teacher") {
        setupAudioMixer();
      }

      console.log(
        "🔌 Attempting connection to audio server:",
        AUDIO_SERVER_URL
      );

      const socket = io(AUDIO_SERVER_URL, socketConfig);
      audioSocketRef.current = socket;

      // Track connection attempts
      let connectionAttempts = 0;
      const maxAttempts = 5;

      socket.on("connect", () => {
        connectionAttempts = 0; // Reset counter on successful connection
        console.log("✅ Socket connected to audio server");

        socket.emit("join-room", {
          roomId: data.roomID,
          username: data.userID,
          role: data.role,
        });

        console.log("📡 Joining room:", {
          roomId: data.roomID,
          username: data.userID,
          role: data.role,
        });
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        connectionAttempts++;
        console.error(
          `❌ Socket connection error (attempt ${connectionAttempts}/${maxAttempts}):`,
          error
        );

        if (connectionAttempts >= maxAttempts) {
          console.error(
            "🚫 Max connection attempts reached. Audio features disabled."
          );
        }
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      });

      socket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection failed:", error);
      });

      socket.on("reconnect_failed", () => {
        console.error("🚫 All reconnection attempts failed");
      });

      socket.on("all-users", (users) => {
        console.log("👥 All users received:", users);

        users.forEach(({ userId, username: uname, role: urole }) => {
          setUsernames((prev) => ({ ...prev, [userId]: uname }));
          setRoles((prev) => ({ ...prev, [userId]: urole }));
          const pc = createPeerConnection(userId, true);
          peerConnectionsRef.current[userId] = pc;
          console.log(`📞 Created peer connection for ${uname} (${urole})`);
        });
      });

      socket.on("user-joined", ({ userId, username: uname, role: urole }) => {
        setUsernames((prev) => ({ ...prev, [userId]: uname }));
        setRoles((prev) => ({ ...prev, [userId]: urole }));
        const pc = createPeerConnection(userId, false);
        peerConnectionsRef.current[userId] = pc;
      });

      socket.on("offer", async ({ sdp, sender }) => {
        const pc = createPeerConnection(sender, false);
        peerConnectionsRef.current[sender] = pc;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { target: sender, sdp: pc.localDescription });
      });

      socket.on("answer", async ({ sdp, sender }) => {
        const pc = peerConnectionsRef.current[sender];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      });

      socket.on("ice-candidate", async ({ candidate, sender }) => {
        const pc = peerConnectionsRef.current[sender];
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      socket.on("user-left", (userId) => {
        const pc = peerConnectionsRef.current[userId];
        if (pc) {
          pc.close();
          delete peerConnectionsRef.current[userId];
        }
        setRemoteStreams((prev) => {
          const { [userId]: _, ...rest } = prev;
          return rest;
        });
        setUsernames((prev) => {
          const { [userId]: _, ...rest } = prev;
          return rest;
        });
        setRoles((prev) => {
          const { [userId]: _, ...rest } = prev;
          return rest;
        });
      });

      // teacher/student mute handlers (existing)
      socket.on("mute", () => {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        setIsMuted(true);
      });

      socket.on("unmute", () => {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
        setIsMuted(false);
      });

      // If server sends uploaded recording URL (optional)
      socket.on("recording-uploaded", ({ url }) => {
        setDownloadUrl(url);
      });
    };

    const createPeerConnection = (userId, isOffer) => {
      const pc = new RTCPeerConnection(peerConfig);
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      if (data.role === "student") {
        pc.addTransceiver("video", { direction: "recvonly" });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          audioSocketRef.current.emit("ice-candidate", {
            target: userId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        console.log(`🎵 Received remote stream from ${userId}:`, stream);
        console.log("  - Active:", stream.active);
        console.log("  - Audio tracks:", stream.getAudioTracks().length);

        setRemoteStreams((prev) => ({ ...prev, [userId]: stream }));

        // ADD: if teacher, add remote streams to mixer (so they end up in mixedStream)
        if (data.role === "teacher") {
          addStreamToMixer(stream);
        }
      };

      if (isOffer) {
        pc.onnegotiationneeded = async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          audioSocketRef.current.emit("offer", {
            target: userId,
            sdp: pc.localDescription,
          });
        };
      }
      return pc;
    };

    joinRoom();

    return () => {
      if (audioSocketRef.current) {
        audioSocketRef.current.disconnect();
      }
      // clean-up audio context & recorder if any
      try {
        stopRecording();
      } catch (e) {
        /* ignore */
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {}
        audioContextRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.roomID, data.userID, data.role]);

  const toggleMute = () => {
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => !prev);
  };

  const handleMuteStudent = (userId) => {
    audioSocketRef.current.emit("mute-student", { target: userId });
  };

  const handleUnmuteStudent = (userId) => {
    audioSocketRef.current.emit("unmute-student", { target: userId });
  };

  // ---------- Audio mixer & recording functions (from code 2) ----------
  const setupAudioMixer = () => {
    if (data.role !== "teacher") return;
    if (audioContextRef.current) return; // Avoid duplicates

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    destinationRef.current =
      audioContextRef.current.createMediaStreamDestination();
    mixedStreamRef.current = destinationRef.current.stream;

    // Add teacher’s mic
    if (localStreamRef.current) {
      try {
        const micSource = audioContextRef.current.createMediaStreamSource(
          localStreamRef.current
        );
        micSource.connect(destinationRef.current);
      } catch (err) {
        console.warn("Failed to add teacher mic to mixer:", err);
      }
    }

    console.log("Audio mixer initialized.");
  };

  const addStreamToMixer = (stream) => {
    if (data.role !== "teacher") return;
    if (!audioContextRef.current || !destinationRef.current) return;

    try {
      const src = audioContextRef.current.createMediaStreamSource(stream);
      src.connect(destinationRef.current);
      console.log("Remote student stream added to mixer");
    } catch (err) {
      console.log("Mixer error:", err);
    }
  };

  const startRecording = async () => {
    if (data.role !== "teacher") return;
    dispatch(startRecordingInStore());
    if (!mixedStreamRef.current) {
      console.error(
        "No mixed stream available — ensure mixer is setup and remote streams have been added."
      );
      // Try to initialize if not done
      setupAudioMixer();
      if (!mixedStreamRef.current) return;
    }

    // resume audio context on user interaction if needed
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        console.warn("AudioContext resume failed:", e);
      }
    }

    recordingRef.current = true;
    setIsRecording(true);

    const recorder = new MediaRecorder(mixedStreamRef.current, {
      mimeType: "audio/webm",
    });

    recorder.ondataavailable = async (e) => {
      if (!recordingRef.current || e.data.size === 0) return;

      try {
        const arrayBuffer = await e.data.arrayBuffer();
        // convert to base64
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );

        // POST chunk to upload server
        const responseofAudio = await fetch(
          `${UPLOAD_SERVER_URL}/upload-chunk`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId: data.roomID,
              chunk: base64,
              classId: data.classID,
            }),
          }
        );
        console.log(
          "Chunk uploaded, server response:",
          await responseofAudio.text()
        );
      } catch (err) {
        console.error("Failed to upload chunk:", err);
      }
    };

    recorder.onerror = (ev) => {
      console.error("MediaRecorder error:", ev);
    };

    // chunk every 2s (like code2)
    recorder.start(2000);
    mediaRecorderRef.current = recorder;

    console.log("Recording started...");
  };

  const stopRecording = () => {
    dispatch(stopRecordingInStore());
    if (mediaRecorderRef.current) {
      recordingRef.current = false;
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("Error while stopping recorder:", e);
      }
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    console.log("Recording stopped.");
  };

  // Auto stop when closing tab
  useEffect(() => {
    const handler = () => {
      stopRecording();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // ----------------------------------------------------------------------

  // data.classID --> sent to audio server
  return (
    <div
      style={{
        width: "10vw",
      }}
    >
      {data.role === "teacher" && (
        <DraggableVideo>
          <video
            autoPlay
            muted
            playsInline
            ref={(el) => {
              if (el && localStreamRef.current) {
                el.srcObject = localStreamRef.current;
              }
            }}
            style={{
              bottom: "20px",
              left: "20px",
              width: "190px",
              height: "130px",
              borderRadius: "12px",
              objectFit: "cover",
              zIndex: 9999,
              backgroundColor: "black",
            }}
          />
        </DraggableVideo>
      )}

      {data.role === "student" &&
        Object.entries(remoteStreams).map(([id, stream]) =>
          roles[id] === "teacher" ? (
            <DraggableVideo>
              <video
                key={id}
                autoPlay
                playsInline
                ref={(el) => {
                  if (el) el.srcObject = stream;
                }}
                style={{
                  bottom: "20px",
                  left: "20px",
                  width: "190px",
                  height: "130px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  zIndex: 9999,
                  backgroundColor: "black",
                }}
              />
            </DraggableVideo>
          ) : null
        )}
      <Whiteboard role={data.role} userID={data.userID} roomID={data.roomID} />
      <CursorOverlay />
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          // This container helps position the two elements on top of each other
          width: "320px",
          height: "450px",
          pointerEvents: "none", // Pass clicks through the container
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        {/* Expanded Panel View */}
        <div
          style={{
            width: "320px",
            maxHeight: "450px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            // The transition magic happens here
            transition: "opacity 300ms ease, transform 300ms ease",
            transformOrigin: "bottom right",
            // Conditionally apply styles for open/closed states
            opacity: isPanelOpen ? 1 : 0,
            transform: isPanelOpen ? "scale(1)" : "scale(0.95)",
            pointerEvents: isPanelOpen ? "auto" : "none",
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 15px",
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: "#f7f7f7",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>
              Participants ({Object.keys(remoteStreams).length + 1})
            </h3>
            <button
              onClick={() => setIsPanelOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                lineHeight: 1,
                padding: "0 5px",
                color: "#666",
              }}
            >
              &times;
            </button>
          </div>

          {/* Participants List (No changes inside this div) */}
          <div style={{ overflowY: "auto", padding: "10px 15px" }}>
            {/* Your Own Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <p style={{ margin: 0, fontWeight: "bold" }}>
                You ({data.userID})
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={toggleMute}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "5px",
                    border: isMuted ? "1px solid #ccc" : "1px solid #d9534f",
                    backgroundColor: isMuted ? "#f0f0f0" : "#d9534f",
                    color: isMuted ? "#333" : "white",
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>

                {/* Teacher recording controls */}
                {data.role === "teacher" && (
                  <>
                    {!isRecording ? (
                      <div>
                        <button
                          onClick={() => {
                            // ensure mixer exists
                            setupAudioMixer();
                            startRecording();
                          }}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "5px",
                            border: "1px solid #007bff",
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Start Recording
                        </button>
                        <button
                          onClick={toggleVideo}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "5px",
                            border: "1px solid #007bff",
                            backgroundColor: "#007bff",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Toggle Video
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => stopRecording()}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "5px",
                          border: "1px solid #d9534f",
                          backgroundColor: "#d9534f",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Stop Recording
                      </button>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  saveWhiteboardState(data.roomID);
                }}
              >
                Save all
              </button>
            </div>

            {/* Remote Participants */}
            {Object.entries(remoteStreams).map(([id, stream]) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {usernames[id] || "Unknown"} ({roles[id] || "student"})
                </p>
                <audio
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el) el.srcObject = stream;
                  }}
                  style={{ display: "none" }}
                />
                {data.role === "teacher" && roles[id] === "student" && (
                  <div
                    style={{ display: "flex", gap: "8px", marginLeft: "10px" }}
                  >
                    <button
                      onClick={() => handleMuteStudent(id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "5px",
                        border: "1px solid #d9534f",
                        backgroundColor: "#d9534f",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Mute
                    </button>
                    <button
                      onClick={() => handleUnmuteStudent(id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "5px",
                        border: "1px solid #5cb85c",
                        backgroundColor: "#5cb85c",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Unmute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* If upload server returns URL show download link */}
          {downloadUrl && (
            <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                ⬇ Download Class Recording
              </a>
            </div>
          )}
        </div>
        {/* I m daddy */}
        {/* Collapsed "Dot" View */}
        <button
          onClick={() => setIsPanelOpen(true)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            fontSize: "12px",
            position: "absolute", // Positioned within the container
            bottom: 0,
            right: 0,
            // Transition and conditional styles for the dot
            transition: "opacity 300ms ease, transform 300ms ease",
            transformOrigin: "bottom right",
            opacity: isPanelOpen ? 0 : 1,
            transform: isPanelOpen ? "scale(0.95)" : "scale(1)",
            pointerEvents: isPanelOpen ? "none" : "auto",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            {Object.keys(remoteStreams).length + 1}
          </span>
          <span>Users</span>
        </button>
      </div>
    </div>
  );
}

export default WhiteboardPage;
