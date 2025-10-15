import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToolType } from '../Whiteboard/whiteboardSlice';
import { toolTypes } from '../constants';
import { theme } from '../styles/theme';

// Import existing icons
import rectangleIcon from '../resources/icons/rectangle.svg';
import Circle from '../resources/icons/circle.svg';

const ShapeDropdown = ({ position, onClose }) => {
  const dispatch = useDispatch();
  const selectedToolType = useSelector((state) => state.whiteboard.tool);
  const dropdownRef = useRef(null);

  const shapes = [
    { type: toolTypes.RECTANGLE, name: 'Rectangle', icon: rectangleIcon },
    { type: toolTypes.CIRCLE, name: 'Circle', icon: Circle },
    { type: toolTypes.TRIANGLE, name: 'Triangle', icon: '🔺' }, // Use emoji instead of problematic PNG
    { type: toolTypes.DIAMOND, name: 'Diamond', icon: '💎' },
    { type: toolTypes.STAR, name: 'Star', icon: '⭐' },
    { type: toolTypes.ARROW, name: 'Arrow', icon: '➡️' },
    { type: toolTypes.PENTAGON, name: 'Pentagon', icon: '⬠' },
    { type: toolTypes.HEXAGON, name: 'Hexagon', icon: '⬡' },
    { type: toolTypes.HEART, name: 'Heart', icon: '❤️' },
    { type: toolTypes.CLOUD, name: 'Cloud', icon: '☁️' }
  ];

  const handleShapeSelect = (shapeType) => {
    dispatch(setToolType(shapeType));
    onClose();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const dropdownStyle = {
    position: 'fixed',
    top: position.y,
    left: position.x - 120, // Center the dropdown
    backgroundColor: theme.colors.gray[800],
    border: `1px solid ${theme.colors.gray[600]}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadow.lg,
    padding: theme.spacing.sm,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    background: 'rgba(31, 41, 55, 0.98)',
    minWidth: '240px',
    maxHeight: '300px',
    overflowY: 'auto'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing.sm,
    padding: theme.spacing.xs
  };

  const shapeButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.gray[600]}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.white,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'left',
    width: '100%'
  };

  const activeShapeButtonStyle = {
    ...shapeButtonStyle,
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[400],
    boxShadow: theme.shadow.sm
  };

  return (
    <div ref={dropdownRef} style={dropdownStyle}>
      <div style={{
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.xs,
        borderBottom: `1px solid ${theme.colors.gray[600]}`,
        color: theme.colors.gray[300],
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Select Shape
      </div>
      
      <div style={gridStyle}>
        {shapes.map((shape) => (
          <button
            key={shape.type}
            onClick={() => handleShapeSelect(shape.type)}
            style={selectedToolType === shape.type ? activeShapeButtonStyle : shapeButtonStyle}
            onMouseEnter={(e) => {
              if (selectedToolType !== shape.type) {
                e.target.style.backgroundColor = theme.colors.gray[700];
                e.target.style.borderColor = theme.colors.gray[500];
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedToolType !== shape.type) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = theme.colors.gray[600];
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={{
              width: '20px', 
              height: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              {(typeof shape.icon === 'string' && 
                (shape.icon.startsWith('/') || 
                 shape.icon.startsWith('data:') || 
                 shape.icon.includes('.svg') || 
                 shape.icon.includes('.png') || 
                 shape.icon.includes('.jpg'))) ? (
                <img 
                  src={shape.icon} 
                  alt={shape.name}
                  style={{
                    width: '18px',
                    height: '18px',
                    filter: 'invert(1) brightness(0.9)'
                  }}
                />
              ) : (
                <span style={{ fontSize: '16px' }}>{shape.icon}</span>
              )}
            </div>
            <span>{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeDropdown;