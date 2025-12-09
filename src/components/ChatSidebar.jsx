import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../styles/theme';
import { useSelector } from 'react-redux';

const ChatSidebar = ({ 
  isOpen, 
  onClose, 
  messages = [], 
  userID, 
  roomID, 
  onSendMessage,
  role = 'student',
  isDarkTheme = false
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sentiment = useSelector((state) => state.whiteboard.sentiment);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      text: input,
      user: userID,
      role: role,
      timestamp: new Date().toISOString(),
      roomID: roomID
    };
    
    onSendMessage(message);
    setInput('');
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message) => message.user === userID || message.userID === userID;

  // Filter out messages without valid content
  const isValidMessage = (message) => {
    // Must have text content
    if (!message.text || message.text.trim() === '') {
      return false;
    }
    
    // If it's our own message, always show it
    if (isOwnMessage(message)) {
      return true;
    }
    
    // For others' messages, check if user info is valid
    const userId = message.user || message.userID;
    return userId && userId !== 'Unknown' && userId.trim() !== '';
  };

  const formatUserName = (message) => {
    if (message.role === 'teacher') {
      return '👨‍🏫 Teacher';
    }
    
    const userId = message.user || message.userID;
    
    // If no userId is available, don't show anything (this will hide the user label)
    if (!userId || userId === 'Unknown' || userId === '') {
      return null;
    }
    
    // If userID looks like an email, show the part before @
    if (userId.includes('@')) {
      const username = userId.split('@')[0];
      return `👨‍🎓 ${username.charAt(0).toUpperCase() + username.slice(1)}`;
    }
    
    // If userID is a number, format it as "Student #123"
    if (/^\d+$/.test(userId)) {
      return `👨‍🎓 Student #${userId}`;
    }
    
    // If userID is a long string, truncate it for better display
    if (userId.length > 15) {
      return `👨‍🎓 ${userId.substring(0, 12)}...`;
    }
    
    // For any other userID, show it with proper formatting
    return `👨‍🎓 ${userId}`;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: theme.zIndex.modal - 1,
            backdropFilter: 'blur(2px)',
          }}
          onClick={onClose}
        />
      )}

      {/* Chat Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-400px',
          width: '400px',
          height: '100vh',
          backgroundColor: isDarkTheme ? '#1f2937' : theme.colors.white,
          color: isDarkTheme ? '#ffffff' : '#000000',
          boxShadow: theme.shadow.xl,
          zIndex: theme.zIndex.modal,
          display: 'flex',
          flexDirection: 'column',
          transition: `right ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
          borderLeft: `1px solid ${isDarkTheme ? '#374151' : theme.colors.gray[200]}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${isDarkTheme ? '#374151' : theme.colors.gray[200]}`,
            background: isDarkTheme 
              ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' 
              : `linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.secondary[50]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: isDarkTheme ? '#ffffff' : theme.colors.gray[800],
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}
            >
              💬 Room Chat --- {sentiment}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.sm,
                color: isDarkTheme ? '#d1d5db' : theme.colors.gray[600],
                marginTop: theme.spacing.xs,
              }}
            >
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: theme.typography.fontSize.xl,
              cursor: 'pointer',
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              color: isDarkTheme ? '#9ca3af' : theme.colors.gray[500],
              transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkTheme ? '#4b5563' : theme.colors.gray[100];
              e.target.style.color = isDarkTheme ? '#ffffff' : theme.colors.gray[700];
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkTheme ? '#9ca3af' : theme.colors.gray[500];
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            padding: theme.spacing.md,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            backgroundColor: isDarkTheme ? '#111827' : theme.colors.gray[50],
          }}
        >
          {messages.filter(isValidMessage).length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: isDarkTheme ? '#9ca3af' : theme.colors.gray[500],
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '3rem',
                  marginBottom: theme.spacing.md,
                }}
              >
                💬
              </div>
              <h4
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.medium,
                  marginBottom: theme.spacing.sm,
                }}
              >
                No messages yet
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                Start a conversation with your {role === 'teacher' ? 'students' : 'teacher and classmates'}!
              </p>
            </div>
          ) : (
            messages.filter(isValidMessage).map((message, index) => (
              <div
                key={message.id || index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage(message) ? 'flex-end' : 'flex-start',
                  marginBottom: theme.spacing.sm,
                }}
              >
                {/* Message bubble */}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.lg,
                    backgroundColor: isOwnMessage(message)
                      ? theme.colors.primary[500]
                      : (isDarkTheme ? '#374151' : theme.colors.white),
                    color: isOwnMessage(message)
                      ? theme.colors.white
                      : (isDarkTheme ? '#ffffff' : theme.colors.gray[800]),
                    boxShadow: theme.shadow.sm,
                    border: isOwnMessage(message)
                      ? 'none'
                      : `1px solid ${isDarkTheme ? '#4b5563' : theme.colors.gray[200]}`,
                    wordBreak: 'break-word',
                  }}
                >
                  {/* User info for received messages */}
                  {!isOwnMessage(message) && formatUserName(message) && (
                    <div
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: isDarkTheme ? '#9ca3af' : theme.colors.gray[600],
                        marginBottom: theme.spacing.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: message.role === 'teacher' 
                            ? theme.colors.primary[500] 
                            : theme.colors.secondary[500],
                        }}
                      />
                      {formatUserName(message)}
                    </div>
                  )}
                  
                  {/* Message text */}
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      lineHeight: '1.4',
                    }}
                  >
                    {message.text}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: isDarkTheme ? '#9ca3af' : theme.colors.gray[500],
                    marginTop: theme.spacing.xs,
                    marginLeft: isOwnMessage(message) ? 0 : theme.spacing.sm,
                    marginRight: isOwnMessage(message) ? theme.spacing.sm : 0,
                  }}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderTop: `1px solid ${isDarkTheme ? '#374151' : theme.colors.gray[200]}`,
            backgroundColor: isDarkTheme ? '#1f2937' : theme.colors.white,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.sm,
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  border: `1px solid ${isDarkTheme ? '#4b5563' : theme.colors.gray[300]}`,
                  borderRadius: theme.borderRadius.lg,
                  fontSize: theme.typography.fontSize.base,
                  fontFamily: theme.typography.fontFamily.sans,
                  resize: 'none',
                  outline: 'none',
                  transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  backgroundColor: isDarkTheme ? '#374151' : theme.colors.white,
                  color: isDarkTheme ? '#ffffff' : '#000000',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary[500];
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary[500]}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDarkTheme ? '#4b5563' : theme.colors.gray[300];
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim()}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: input.trim() 
                  ? theme.colors.primary[500] 
                  : theme.colors.gray[300],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.lg,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '50px',
                height: '44px',
                boxShadow: input.trim() ? theme.shadow.sm : 'none',
              }}
              onMouseEnter={(e) => {
                if (input.trim()) {
                  e.target.style.backgroundColor = theme.colors.primary[600];
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = theme.shadow.md;
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim()) {
                  e.target.style.backgroundColor = theme.colors.primary[500];
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = theme.shadow.sm;
                }
              }}
            >
              {isTyping ? '📤' : '💬'}
            </button>
          </div>
          
          <div
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: isDarkTheme ? '#9ca3af' : theme.colors.gray[500],
              marginTop: theme.spacing.xs,
              textAlign: 'center',
            }}
          >
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;