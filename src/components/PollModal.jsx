import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const PollModal = ({ 
  isOpen, 
  onClose, 
  role = 'student',
  userID,
  pollData = null,
  pollResult = null,
  onCreatePoll,
  onAnswerPoll
}) => {
  console.log('=== POLL MODAL DEBUG ===');
  console.log('isOpen:', isOpen);
  console.log('role:', role);
  console.log('pollData received:', JSON.stringify(pollData, null, 2));
  console.log('pollResult:', pollResult);
  

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
  const [correctAnswer, setCorrectAnswer] = useState(1);

  // Load saved poll results from localStorage

  useEffect(() => {
    if (pollResult) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pollResult, onClose]);

  // Reset selection when new poll data arrives
  useEffect(() => {
    if (pollData) {
      setSelectedAnswer(null);
    }
  }, [pollData]);

  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) {
      return;
    }
    
    const pollDataToSend = {
      question: pollQuestion,
      options: pollOptions,
      correctAnswer: correctAnswer
    };
    
    onCreatePoll(pollDataToSend);
    
    setPollQuestion('');
    setPollOptions(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
    setCorrectAnswer(1);
    onClose();
  };

  const handleAnswerPoll = (answer) => {
    setSelectedAnswer(answer);
    onAnswerPoll(answer);
  };

  const updateOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  if (!isOpen) return null;

  // Debug logging


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
        background: theme.colors.white,
        borderRadius: theme.borderRadius['2xl'],
        boxShadow: theme.shadow['2xl'],
        padding: theme.spacing['2xl'],
        minWidth: '500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'scaleIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.xl
        }}>
          <div>
            <h3 style={{ 
              margin: 0, 
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[800],
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}>
              📊 {role === 'teacher' ? 'Create Poll' : 'Answer Poll'}
            </h3>
            <p style={{
              margin: `${theme.spacing.xs} 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600]
            }}>
              {role === 'teacher' 
                ? 'Create a poll for your students' 
                : 'Select the correct answer'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.gray[400],
              fontSize: theme.typography.fontSize.xl,
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = theme.colors.gray[600];
              e.target.style.backgroundColor = theme.colors.gray[100];
            }}
            onMouseLeave={(e) => {
              e.target.style.color = theme.colors.gray[400];
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Teacher: Create Poll */}
        {role === 'teacher' && (
          <div>
            {/* Question Input */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.gray[700],
                marginBottom: theme.spacing.sm
              }}>
                Poll Question
              </label>
              <textarea
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="What is the capital of France?"
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  border: `2px solid ${theme.colors.gray[200]}`,
                  borderRadius: theme.borderRadius.xl,
                  fontSize: theme.typography.fontSize.base,
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

            {/* Options */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{
                display: 'block',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.gray[700],
                marginBottom: theme.spacing.sm
              }}>
                Answer Options
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {pollOptions.map((option, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: correctAnswer === index + 1 
                        ? theme.colors.success[500] 
                        : theme.colors.gray[200],
                      color: correctAnswer === index + 1 
                        ? theme.colors.white 
                        : theme.colors.gray[600],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setCorrectAnswer(index + 1)}
                    >
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                        border: `1px solid ${theme.colors.gray[200]}`,
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.typography.fontSize.sm,
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.colors.primary[400];
                        e.target.style.boxShadow = `0 0 0 2px ${theme.colors.primary[100]}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.colors.gray[200];
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
              <p style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.gray[500],
                marginTop: theme.spacing.sm,
                textAlign: 'center'
              }}>
                Click on the number to mark it as the correct answer
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreatePoll}
              disabled={!pollQuestion.trim()}
              style={{
                width: '100%',
                padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                background: pollQuestion.trim()
                  ? theme.colors.primary.gradient 
                  : theme.colors.gray[300],
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.xl,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: pollQuestion.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (pollQuestion.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = theme.shadow.lg;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Create Poll 📊
            </button>
          </div>
        )}

        {/* Student: Answer Poll */}
        {role === 'student' && pollData && (
          <div>
            {/* Poll Result Display */}
            {pollResult && (
              <div style={{
                padding: theme.spacing.xl,
                background: pollResult.includes('Congrats') 
                  ? theme.colors.success[50] 
                  : theme.colors.error[50],
                border: `2px solid ${pollResult.includes('Congrats') 
                  ? theme.colors.success[200] 
                  : theme.colors.error[200]}`,
                borderRadius: theme.borderRadius.xl,
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
                animation: 'bounceIn 0.5s ease-out'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: theme.spacing.md
                }}>
                  {pollResult.includes('Congrats') ? '🎉' : '😔'}
                </div>
                <h3 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: pollResult.includes('Congrats') 
                    ? theme.colors.success[800] 
                    : theme.colors.error[800]
                }}>
                  {pollResult}
                </h3>
              </div>
            )}

            {/* Question */}
            {!pollResult && (
              <div style={{
                padding: theme.spacing.lg,
                background: theme.colors.gray[50],
                borderRadius: theme.borderRadius.xl,
                marginBottom: theme.spacing.lg,
                border: `1px solid ${theme.colors.gray[200]}`
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.gray[800],
                  textAlign: 'center'
                }}>
                  {pollData?.question || 'Loading question...'}
                </h4>
              </div>
            )}

            {/* Answer Options */}
            {!pollResult && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.md
              }}>
              {[1, 2, 3, 4].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerPoll(option)}
                  disabled={selectedAnswer !== null}
                  style={{
                    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
                    background: selectedAnswer === option 
                      ? theme.colors.primary[100]
                      : theme.colors.white,
                    color: selectedAnswer === option 
                      ? theme.colors.primary[800]
                      : theme.colors.gray[700],
                    border: `2px solid ${selectedAnswer === option 
                      ? theme.colors.primary[300]
                      : theme.colors.gray[200]}`,
                    borderRadius: theme.borderRadius.xl,
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                    cursor: selectedAnswer !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAnswer === null) {
                      e.target.style.backgroundColor = theme.colors.gray[50];
                      e.target.style.borderColor = theme.colors.primary[300];
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = theme.shadow.md;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnswer === null) {
                      e.target.style.backgroundColor = theme.colors.white;
                      e.target.style.borderColor = theme.colors.gray[200];
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: selectedAnswer === option 
                      ? theme.colors.primary[500]
                      : theme.colors.gray[200],
                    color: selectedAnswer === option 
                      ? theme.colors.white
                      : theme.colors.gray[600],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold
                  }}>
                    {option}
                  </div>
                  <span style={{ flex: 1 }}>
                    {pollData.options && pollData.options[option - 1] 
                      ? pollData.options[option - 1] 
                      : `Option ${option}`
                    }
                  </span>
                </button>
              ))}
              </div>
            )}
          </div>
        )}
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
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PollModal;