import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/modals/ImageLightboxModal.css';

/**
 * ImageLightboxModal - Full-screen image viewer modal
 * 
 * Features:
 * - Renders via React Portal at document.body level for correct positioning
 * - Prevents background scrolling when open
 * - Keyboard navigation (Arrow keys, Escape)
 * - Image navigation for multiple images
 * - Scrollable content when image exceeds viewport
 */
const ImageLightboxModal = ({ isOpen, images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Constants for scroll position storage
  const SCROLL_Y_ATTR = 'data-scroll-y';
  const SCROLL_X_ATTR = 'data-scroll-x';

  /**
   * Locks body scroll by setting position: fixed
   * Saves current scroll position for restoration
   */
  const lockBodyScroll = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
    
    // Store scroll position for restoration
    document.body.setAttribute(SCROLL_Y_ATTR, scrollY.toString());
    document.body.setAttribute(SCROLL_X_ATTR, scrollX.toString());
    
    // Lock body in place
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  };

  /**
   * Unlocks body scroll and restores previous scroll position
   */
  const unlockBodyScroll = () => {
    const scrollY = document.body.getAttribute(SCROLL_Y_ATTR);
    const scrollX = document.body.getAttribute(SCROLL_X_ATTR);
    
    // Remove all lock styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    // Remove data attributes
    document.body.removeAttribute(SCROLL_Y_ATTR);
    document.body.removeAttribute(SCROLL_X_ATTR);
    
    // Restore scroll position
    if (scrollY || scrollX) {
      window.scrollTo(parseInt(scrollX || '0'), parseInt(scrollY || '0'));
    }
  };

  // Update current index when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handle scroll locking, keyboard events, and cleanup
  useEffect(() => {
    if (!isOpen) {
      // Cleanup: unlock scroll when modal closes
      unlockBodyScroll();
      return;
    }

    // Keyboard event handler
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
          break;
        default:
          break;
      }
    };

    // Lock body scroll
    lockBodyScroll();
    
    // Add keyboard listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, [isOpen, images.length, onClose]);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (e) => {
    // Prevent modal from closing when clicking on the image
    e.stopPropagation();
  };

  // Don't render if modal is closed or no images
  if (!isOpen || !images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  // Modal content JSX
  const modalContent = (
    <div className="image-lightbox-overlay" onClick={onClose}>
      <div className="image-lightbox-container" onClick={handleImageClick}>
        {/* Close button - always visible */}
        <button
          className="image-lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          ✕
        </button>

        {/* Previous button - only show if multiple images */}
        {hasMultipleImages && (
          <button
            className="image-lightbox-nav image-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* Image container */}
        <div className="image-lightbox-image-wrapper">
          <img
            src={currentImage}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="image-lightbox-image"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>

        {/* Next button - only show if multiple images */}
        {hasMultipleImages && (
          <button
            className="image-lightbox-nav image-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
          >
            ›
          </button>
        )}

        {/* Image counter - only show if multiple images */}
        {hasMultipleImages && (
          <div className="image-lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal at document.body level to ensure correct positioning
  // regardless of parent element transforms or scroll position
  return createPortal(modalContent, document.body);
};

export default ImageLightboxModal;

