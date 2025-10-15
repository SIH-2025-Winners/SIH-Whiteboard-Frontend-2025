import React, { useState } from 'react';
import { theme } from '../styles/theme';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  onAddImage,
  mousePosition = { x: 0, y: 0 }
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Simple URL validation and preview
    if (url && isValidUrl(url)) {
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddImage = async () => {
    if (!imageUrl.trim()) {
      return;
    }

    if (!isValidUrl(imageUrl)) {
      return;
    }

    setIsLoading(true);

    try {
      // Create a new image to test if it loads
      const img = new Image();
      
      const imagePromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      const loadedImage = await imagePromise;
      
      // Limit image size for performance
      const maxSize = 500;
      let { width, height } = loadedImage;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Call the parent function to add the image
      onAddImage({
        url: imageUrl,
        width,
        height,
        position: mousePosition
      });

      // Reset and close
      setImageUrl('');
      setPreviewImage(null);
      onClose();

      
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && imageUrl.trim()) {
      handleAddImage();
    } else if (e.key === 'Escape') {
      onClose();
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
        background: theme.colors.white,
        borderRadius: theme.borderRadius['2xl'],
        boxShadow: theme.shadow['2xl'],
        padding: theme.spacing['2xl'],
        minWidth: '500px',
        maxWidth: '90vw',
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
              🖼️ Add Image
            </h3>
            <p style={{
              margin: `${theme.spacing.xs} 0 0`,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600]
            }}>
              Enter an image URL to add it to the whiteboard
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

        {/* URL Input */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{
            display: 'block',
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.gray[700],
            marginBottom: theme.spacing.sm
          }}>
            Image URL
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/image.jpg"
            autoFocus
            style={{
              width: '100%',
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              border: `2px solid ${theme.colors.gray[200]}`,
              borderRadius: theme.borderRadius.xl,
              fontSize: theme.typography.fontSize.base,
              fontFamily: theme.typography.fontFamily.sans,
              outline: 'none',
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

        {/* Image Preview */}
        {previewImage && (
          <div style={{
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.lg,
            border: `2px dashed ${theme.colors.gray[300]}`,
            borderRadius: theme.borderRadius.xl,
            textAlign: 'center',
            backgroundColor: theme.colors.gray[50]
          }}>
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[600],
              marginBottom: theme.spacing.md
            }}>
              Preview:
            </p>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadow.md
              }}
              onError={() => {
                setPreviewImage(null);

              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              background: theme.colors.white,
              color: theme.colors.gray[600],
              border: `1px solid ${theme.colors.gray[300]}`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.gray[50];
              e.target.style.borderColor = theme.colors.gray[400];
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.white;
              e.target.style.borderColor = theme.colors.gray[300];
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleAddImage}
            disabled={!imageUrl.trim() || isLoading}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              background: imageUrl.trim() && !isLoading
                ? theme.colors.primary.gradient 
                : theme.colors.gray[300],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: imageUrl.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              minWidth: '120px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (imageUrl.trim() && !isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = theme.shadow.lg;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading...
              </>
            ) : (
              <>
                Add Image
                🖼️
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div style={{
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.blue?.[50] || theme.colors.primary[50],
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.blue?.[200] || theme.colors.primary[200]}`
        }}>
          <p style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.blue?.[800] || theme.colors.primary[800],
            margin: 0,
            lineHeight: 1.4
          }}>
            💡 <strong>Tip:</strong> Make sure the URL points directly to an image file (jpg, png, gif, etc.). 
            You can right-click on any image online and select "Copy image address" to get a direct URL.
          </p>
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageModal;