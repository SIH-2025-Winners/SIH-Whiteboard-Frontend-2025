import React, { useState, useEffect } from 'react';
import { isSocketConnected, getSocketId } from '../socketConn/socketConn';

const SocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    const checkStatus = () => {
      setIsConnected(isSocketConnected());
      setSocketId(getSocketId());
    };

    // Check immediately
    checkStatus();

    // Check every 2 seconds
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '10px',
        backgroundColor: isConnected ? '#10b981' : '#ef4444',
        color: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}
    >
      <div>Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      {socketId && <div>ID: {socketId}</div>}
    </div>
  );
};

export default SocketStatus;