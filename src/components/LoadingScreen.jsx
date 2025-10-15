import React from 'react';
import { theme } from '../styles/theme';

const LoadingScreen = ({ role = 'student' }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: theme.colors.primary.gradient,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: theme.zIndex.modal,
      color: theme.colors.white
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Animated Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: theme.borderRadius['2xl'],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: theme.typography.fontWeight.bold
          }}>
            📝
          </div>
        </div>

        {/* Loading Spinner */}
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px'
        }}></div>

        {/* Loading Text */}
        <h2 style={{ 
          margin: 0, 
          fontSize: theme.typography.fontSize['2xl'], 
          fontWeight: theme.typography.fontWeight.light,
          marginBottom: theme.spacing.sm
        }}>
          Loading Whiteboard...
        </h2>
        
        <p style={{ 
          margin: 0, 
          opacity: 0.8, 
          fontSize: theme.typography.fontSize.base 
        }}>
          {role === 'teacher' ? '🎓 Preparing teaching tools' : '👋 Joining classroom'}
        </p>

        {/* Progress Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.lg
        }}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;