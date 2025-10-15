import { theme } from './theme';

export const animations = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-4px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(4px);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
    }
  }
  
  /* Utility animation classes */
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .animate-slideInRight {
    animation: slideInRight ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .animate-slideInLeft {
    animation: slideInLeft ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .animate-slideInUp {
    animation: slideInUp ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .animate-slideInDown {
    animation: slideInDown ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .animate-bounceIn {
    animation: bounceIn ${theme.animation.duration.slow} ${theme.animation.easing.bounce};
  }
  
  .animate-fadeIn {
    animation: fadeIn ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  
  .animate-shake {
    animation: shake 0.5s ${theme.animation.easing.default};
  }
  
  .animate-scaleIn {
    animation: scaleIn ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  /* Hover effects */
  .hover-lift {
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.lg};
  }
  
  .hover-scale {
    transition: transform ${theme.animation.duration.fast} ${theme.animation.easing.default};
  }
  
  .hover-scale:hover {
    transform: scale(1.05);
  }
  
  .hover-glow {
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  }
`;

export default animations;