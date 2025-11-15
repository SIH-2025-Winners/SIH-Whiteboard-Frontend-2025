import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [role, setRole] = useState("");
  const [roomID, setRoomID] = useState("");
  const [userID, setUserID] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryRole = params.get("role");
    const queryRoomID = params.get("roomID");
    const userID = params.get("userID");
    const classID = params.get("classID");

    if (queryRole && queryRoomID) {
      navigate("/whiteboard", {
        state: { role: queryRole, roomID: queryRoomID, userID: userID, classID: classID },
      });
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!role) newErrors.role = "Please select your role";
    if (!roomID.trim()) newErrors.roomID = "Room ID is required";
    if (!userID.trim()) newErrors.userID = "User ID is required";
    if (userID.trim().length < 2) newErrors.userID = "User ID must be at least 2 characters";
    if (roomID.trim().length < 3) newErrors.roomID = "Room ID must be at least 3 characters";
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRedirect = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsJoining(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const data = { roomID: roomID.trim(), role, userID: userID.trim() };
      navigate("/whiteboard", { state: data });
      console.log("Redirected to whiteboard:", data);
    }, 800);
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    container: {
      maxWidth: '420px',
      width: '100%',
      background: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logo: {
      width: '64px',
      height: '64px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    formGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#374151',
      fontSize: '14px',
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
      background: '#ffffff',
      transition: 'border-color 0.2s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#2563eb',
      },
    },
    button: {
      width: '100%',
      padding: '12px 24px',
      background: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    buttonHover: {
      backgroundColor: '#1d4ed8',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    errorText: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '6px',
      fontWeight: '400',
    },
    roleCard: {
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '12px',
      background: '#ffffff',
    },
    roleCardSelected: {
      borderColor: '#2563eb',
      background: '#eff6ff',
    },
    roleIcon: {
      fontSize: '20px',
      marginBottom: '8px',
      display: 'block',
    },
    roleTitle: {
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px',
      fontSize: '16px',
    },
    roleDescription: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: '1.4',
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <img
              src="/GyaanSetuIcon.jpeg"
              alt="GyaanSetu"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
          </div>
          <h1 style={styles.title}>Join Whiteboard</h1>
          <p style={styles.subtitle}>
            Enter your details to join a collaborative session
          </p>
        </div>

        <form onSubmit={handleRedirect}>
          {/* Role Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Your Role</label>
            <div>
              <div
                style={{
                  ...styles.roleCard,
                  ...(role === 'teacher' ? styles.roleCardSelected : {})
                }}
                onClick={() => setRole('teacher')}
              >
                <div style={styles.roleTitle}>Teacher</div>
                <div style={styles.roleDescription}>Create and manage sessions</div>
              </div>
              <div
                style={{
                  ...styles.roleCard,
                  ...(role === 'student' ? styles.roleCardSelected : {})
                }}
                onClick={() => setRole('student')}
              >
                <div style={styles.roleTitle}>Student</div>
                <div style={styles.roleDescription}>Join and collaborate</div>
              </div>
            </div>
            {errors.role && <p style={styles.errorText}>{errors.role}</p>}
          </div>

          {/* Room ID */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Room ID</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={roomID}
                onChange={(e) => {
                  setRoomID(e.target.value);
                  if (errors.roomID) setErrors(prev => ({ ...prev, roomID: null }));
                }}
                placeholder="Enter the room identifier"
                style={{
                  ...styles.input,
                  borderColor: errors.roomID ? '#ef4444' : '#e5e7eb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                }}
                onBlur={(e) => {
                  if (!errors.roomID) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              />
            </div>
            {errors.roomID && <p style={styles.errorText}>{errors.roomID}</p>}
          </div>

          {/* User ID */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Your Name</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={userID}
                onChange={(e) => {
                  setUserID(e.target.value);
                  if (errors.userID) setErrors(prev => ({ ...prev, userID: null }));
                }}
                placeholder="Enter your display name"
                style={{
                  ...styles.input,
                  borderColor: errors.userID ? '#ef4444' : '#e5e7eb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                }}
                onBlur={(e) => {
                  if (!errors.userID) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              />
            </div>
            {errors.userID && <p style={styles.errorText}>{errors.userID}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isJoining}
            style={{
              ...styles.button,
              ...(isJoining ? styles.buttonDisabled : {})
            }}
            onMouseOver={(e) => {
              if (!isJoining) {
                e.target.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseOut={(e) => {
              if (!isJoining) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {isJoining ? (
              <>
                <div style={styles.spinner}></div>
                Joining Session...
              </>
            ) : (
              <>
                Join Whiteboard
              </>
            )}
          </button>
        </form>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
