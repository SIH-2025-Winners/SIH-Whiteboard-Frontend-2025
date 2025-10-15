import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../styles/theme';

const ChatModal = ({ 
  isOpen, 
  onClose, 
  messages, 
  userID, 
  roomID, 
  onSendMessage 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: theme.zIndex.modal,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        background: theme.colors.white,
        borderRadius: theme.borderRadius['2xl'],
        boxShadow: theme.shadow['2xl'],
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'scaleIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: theme.spacing.xl,
          background: theme.colors.primary.gradient,
          color: theme.colors.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold
            }}>
              💬 Classroom Chat
            </h3>
            <p style={{ 
              margin: `${theme.spacing.xs} 0 0`, 
              fontSize: theme.typography.fontSize.sm, 
              opacity: 0.9 
            }}>
              Connected as {userID} • {messages.length} messages
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: theme.colors.white,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: theme.typography.fontSize.lg,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: theme.spacing.lg,
          overflowY: 'auto',
          background: `linear-gradient(to bottom, ${theme.colors.gray[50]}, ${theme.colors.white})`,
          minHeight: '300px',
          maxHeight: '400px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: theme.colors.gray[500],
              fontSize: theme.typography.fontSize.sm,
              padding: theme.spacing.xl
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: theme.spacing.md,
                opacity: 0.3
              }}>
                💬
              </div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.userID === userID;
              const showAvatar = index === 0 || messages[index - 1].userID !== msg.userID;
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    marginBottom: theme.spacing.md,
                    alignItems: 'flex-end',
                    gap: theme.spacing.sm
                  }}
                >
                  {/* Avatar */}
                  {showAvatar && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isOwnMessage 
                        ? theme.colors.primary.gradient 
                        : theme.colors.gray[400],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.colors.white,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.bold,
                      flexShrink: 0
                    }}>
                      {msg.userID.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {!showAvatar && <div style={{ width: '32px' }} />}

                  {/* Message Bubble */}
                  <div style={{
                    maxWidth: '70%',
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.xl,
                    background: isOwnMessage 
                      ? theme.colors.primary.gradient
                      : theme.colors.white,
                    color: isOwnMessage 
                      ? theme.colors.white 
                      : theme.colors.gray[800],
                    boxShadow: theme.shadow.sm,
                    position: 'relative',
                    animation: 'slideInUp 0.3s ease-out'
                  }}>
                    {/* Username */}
                    {showAvatar && !isOwnMessage && (
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                        opacity: 0.8,
                        marginBottom: theme.spacing.xs
                      }}>
                        {msg.userID}
                      </div>
                    )}
                    
                    {/* Message Text */}
                    <div style={{
                      fontSize: theme.typography.fontSize.sm,
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: theme.spacing.lg,
          borderTop: `1px solid ${theme.colors.gray[200]}`,
          background: theme.colors.white
        }}>
          <div style={{
            display: 'flex',
            gap: theme.spacing.md,
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  border: `2px solid ${theme.colors.gray[200]}`,
                  borderRadius: theme.borderRadius.xl,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.sans,
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  backgroundColor: theme.colors.gray[50]
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary[400];
                  e.target.style.backgroundColor = theme.colors.white;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.gray[200];
                  e.target.style.backgroundColor = theme.colors.gray[50];
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                background: input.trim() 
                  ? theme.colors.primary.gradient 
                  : theme.colors.gray[300],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.xl,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                minWidth: '80px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = theme.shadow.lg;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span>Send</span>
              <span>📤</span>
            </button>
          </div>
          
          {/* Character count */}
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.gray[500],
            textAlign: 'right',
            marginTop: theme.spacing.xs
          }}>
            {input.length}/500
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatModal;