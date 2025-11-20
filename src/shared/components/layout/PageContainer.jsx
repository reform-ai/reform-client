import React from 'react';

/**
 * Common page container wrapper with consistent styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render inside container
 * @param {string} props.maxWidth - Maximum width (default: '1200px')
 * @param {string} props.className - Additional CSS class name
 */
const PageContainer = ({ children, maxWidth = '1200px', className = '' }) => {
  const responsivePadding = 'min(24px, 4vw)';

  return (
    <div 
      className={className}
      style={{ 
        minHeight: '100vh', 
        padding: responsivePadding,
        maxWidth: maxWidth,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
};

export default PageContainer;

