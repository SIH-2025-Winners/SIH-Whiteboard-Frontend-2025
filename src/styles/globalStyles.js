import { theme } from './theme';
import { animations } from './animations';

export const globalStyles = `
  ${animations}
  
  /* Reset and base styles */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: ${theme.typography.fontFamily.sans};
    font-size: ${theme.typography.fontSize.base};
    line-height: 1.6;
    color: ${theme.colors.gray[800]};
    background: ${theme.colors.gray[50]};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${theme.colors.gray[100]};
    border-radius: ${theme.borderRadius.full};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray[300]};
    border-radius: ${theme.borderRadius.full};
    transition: background ${theme.animation.duration.normal};
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.gray[400]};
  }
  
  /* Focus styles */
  :focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  :focus:not(:focus-visible) {
    outline: none;
  }
  
  /* Selection styles */
  ::selection {
    background: ${theme.colors.primary[200]};
    color: ${theme.colors.primary[900]};
  }
  
  /* Common utility classes */
  .glass-effect {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .gradient-bg {
    background: ${theme.colors.primary.gradient};
  }
  
  .shadow-sm {
    box-shadow: ${theme.shadow.sm};
  }
  
  .shadow-md {
    box-shadow: ${theme.shadow.md};
  }
  
  .shadow-lg {
    box-shadow: ${theme.shadow.lg};
  }
  
  .shadow-xl {
    box-shadow: ${theme.shadow.xl};
  }
  
  .shadow-glass {
    box-shadow: ${theme.shadow.glass};
  }
  
  /* Button base styles */
  .btn-base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: none;
    border-radius: ${theme.borderRadius.lg};
    font-family: ${theme.typography.fontFamily.sans};
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.medium};
    text-decoration: none;
    cursor: pointer;
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
    user-select: none;
  }
  
  .btn-base:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-primary {
    background: ${theme.colors.primary.gradient};
    color: ${theme.colors.white};
    box-shadow: ${theme.shadow.md};
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.lg};
  }
  
  .btn-secondary {
    background: ${theme.colors.white};
    color: ${theme.colors.gray[700]};
    border: 1px solid ${theme.colors.gray[300]};
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }
  
  .btn-success {
    background: ${theme.colors.success[500]};
    color: ${theme.colors.white};
  }
  
  .btn-success:hover:not(:disabled) {
    background: ${theme.colors.success[600]};
  }
  
  .btn-warning {
    background: ${theme.colors.warning[500]};
    color: ${theme.colors.white};
  }
  
  .btn-warning:hover:not(:disabled) {
    background: ${theme.colors.warning[600]};
  }
  
  .btn-error {
    background: ${theme.colors.error[500]};
    color: ${theme.colors.white};
  }
  
  .btn-error:hover:not(:disabled) {
    background: ${theme.colors.error[600]};
  }
  
  /* Input base styles */
  .input-base {
    width: 100%;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.colors.gray[300]};
    border-radius: ${theme.borderRadius.lg};
    font-family: ${theme.typography.fontFamily.sans};
    font-size: ${theme.typography.fontSize.sm};
    background: ${theme.colors.white};
    transition: all ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .input-base:focus {
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  .input-base::placeholder {
    color: ${theme.colors.gray[400]};
  }
  
  /* Modal base styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${theme.zIndex.modal};
    animation: fadeIn ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  .modal-content {
    background: ${theme.colors.white};
    border-radius: ${theme.borderRadius['2xl']};
    box-shadow: ${theme.shadow['2xl']};
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    animation: scaleIn ${theme.animation.duration.normal} ${theme.animation.easing.default};
  }
  
  /* Notification styles */
  .notification {
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.lg};
    color: ${theme.colors.white};
    font-weight: ${theme.typography.fontWeight.medium};
    box-shadow: ${theme.shadow.lg};
    animation: slideInRight ${theme.animation.duration.normal} ${theme.animation.easing.default};
    max-width: 400px;
    word-wrap: break-word;
  }
  
  .notification-success {
    background: ${theme.colors.success[500]};
  }
  
  .notification-error {
    background: ${theme.colors.error[500]};
  }
  
  .notification-warning {
    background: ${theme.colors.warning[500]};
  }
  
  .notification-info {
    background: ${theme.colors.primary[500]};
  }
  
  /* Tooltip styles */
  .tooltip {
    position: absolute;
    background: ${theme.colors.gray[800]};
    color: ${theme.colors.white};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.md};
    font-size: ${theme.typography.fontSize.xs};
    white-space: nowrap;
    z-index: ${theme.zIndex.tooltip};
    pointer-events: none;
    animation: fadeIn ${theme.animation.duration.fast} ${theme.animation.easing.default};
  }
  
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${theme.colors.gray[800]} transparent transparent transparent;
  }
  
  /* Loading spinner */
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid ${theme.colors.gray[200]};
    border-top: 4px solid ${theme.colors.primary[500]};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  /* Responsive utilities */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing.md};
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 ${theme.spacing.sm};
    }
    
    .btn-base {
      padding: ${theme.spacing.xs} ${theme.spacing.sm};
      font-size: ${theme.typography.fontSize.xs};
    }
    
    .modal-content {
      margin: ${theme.spacing.md};
      max-width: calc(100vw - ${theme.spacing.xl});
    }
  }
  
  /* Text utilities */
  .text-xs { font-size: ${theme.typography.fontSize.xs}; }
  .text-sm { font-size: ${theme.typography.fontSize.sm}; }
  .text-base { font-size: ${theme.typography.fontSize.base}; }
  .text-lg { font-size: ${theme.typography.fontSize.lg}; }
  .text-xl { font-size: ${theme.typography.fontSize.xl}; }
  .text-2xl { font-size: ${theme.typography.fontSize['2xl']}; }
  .text-3xl { font-size: ${theme.typography.fontSize['3xl']}; }
  
  .font-light { font-weight: ${theme.typography.fontWeight.light}; }
  .font-normal { font-weight: ${theme.typography.fontWeight.normal}; }
  .font-medium { font-weight: ${theme.typography.fontWeight.medium}; }
  .font-semibold { font-weight: ${theme.typography.fontWeight.semibold}; }
  .font-bold { font-weight: ${theme.typography.fontWeight.bold}; }
  
  /* Color utilities */
  .text-primary { color: ${theme.colors.primary[600]}; }
  .text-success { color: ${theme.colors.success[600]}; }
  .text-warning { color: ${theme.colors.warning[600]}; }
  .text-error { color: ${theme.colors.error[600]}; }
  .text-gray { color: ${theme.colors.gray[600]}; }
  
  /* Spacing utilities */
  .p-xs { padding: ${theme.spacing.xs}; }
  .p-sm { padding: ${theme.spacing.sm}; }
  .p-md { padding: ${theme.spacing.md}; }
  .p-lg { padding: ${theme.spacing.lg}; }
  .p-xl { padding: ${theme.spacing.xl}; }
  
  .m-xs { margin: ${theme.spacing.xs}; }
  .m-sm { margin: ${theme.spacing.sm}; }
  .m-md { margin: ${theme.spacing.md}; }
  .m-lg { margin: ${theme.spacing.lg}; }
  .m-xl { margin: ${theme.spacing.xl}; }
  
  /* Flexbox utilities */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .gap-xs { gap: ${theme.spacing.xs}; }
  .gap-sm { gap: ${theme.spacing.sm}; }
  .gap-md { gap: ${theme.spacing.md}; }
  .gap-lg { gap: ${theme.spacing.lg}; }
`;

export default globalStyles;