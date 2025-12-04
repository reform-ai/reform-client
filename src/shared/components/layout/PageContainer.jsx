import React from 'react';

/**
 * PageContainer - Common page container wrapper with consistent styling
 * 
 * Provides a consistent container for page content with responsive padding,
 * max-width constraint, and centered layout. Used across all pages to maintain
 * visual consistency.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render inside the container
 * @param {string} [props.maxWidth='1200px'] - Maximum width of the container
 * @param {string} [props.className=''] - Additional CSS class names to apply
 * 
 * @returns {JSX.Element} Container div with responsive styling
 * 
 * @example
 * // Basic usage
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageContainer>
 * 
 * @example
 * // With custom max width
 * <PageContainer maxWidth="800px">
 *   <FormComponent />
 * </PageContainer>
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

