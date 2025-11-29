import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import '../shared/styles/AnalysisSkeleton.css';
import { termsContent } from '../data/termsContent';

const TermsPage = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (sectionId) => expandedSections.has(sectionId);

  // Helper function to render content (handles strings, arrays, objects with special formatting)
  const renderContent = (content) => {
    if (typeof content === 'string') {
      return <p style={{ marginBottom: '12px' }}>{content}</p>;
    }
    
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (typeof item === 'string') {
          return <p key={index} style={{ marginBottom: '12px' }}>{item}</p>;
        }
        if (item && typeof item === 'object') {
          if (item.list) {
            return (
              <ul key={index} style={{ marginLeft: '20px', marginBottom: '12px' }}>
                {item.list.map((listItem, listIndex) => (
                  <li key={listIndex}>{listItem}</li>
                ))}
              </ul>
            );
          }
          if (item.bold) {
            return <p key={index} style={{ marginBottom: '12px' }}><strong>{item.bold}</strong></p>;
          }
        }
        return null;
      });
    }
    
    return null;
  };

  const sectionStyle = {
    marginBottom: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '16px 20px',
    background: 'var(--bg-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '17px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    transition: 'background 0.2s ease'
  };

  const contentStyle = {
    padding: '20px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Legal</p>
            <h1 className="skeleton-title">TERMS AND CONDITIONS</h1>
            <p className="skeleton-subtitle">
              Last updated: November 21, 2025
            </p>
          </div>
        </header>

        <article className="skeleton-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ padding: '32px' }}>
            {/* Introduction */}
            <div style={{ 
              fontFamily: 'Arial, sans-serif',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '32px'
            }}>
              <h2 style={{ 
                fontSize: '19px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                {termsContent.introduction.title}
              </h2>
              {termsContent.introduction.content.map((paragraph, index) => {
                // Handle links in text
                const parts = paragraph.split(/(https?:\/\/[^\s]+|support@reformgym\.fit|donotreply@reformgym\.fit)/g);
                return (
                  <p key={index} style={{ marginBottom: '12px' }}>
                    {parts.map((part, partIndex) => {
                      if (part.startsWith('http')) {
                        return <a key={partIndex} href={part} style={{ color: '#3030F1' }}>{part}</a>;
                      }
                      if (part.includes('@')) {
                        return <a key={partIndex} href={`mailto:${part}`} style={{ color: '#3030F1' }}>{part}</a>;
                      }
                      return <span key={partIndex}>{part}</span>;
                    })}
                  </p>
                );
              })}
            </div>

            {/* Expandable Sections */}
            {termsContent.sections.map((section) => (
              <div key={section.id} id={section.id} style={sectionStyle}>
                <div 
                  style={headerStyle}
                  onClick={() => toggleSection(section.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                >
                  <span>{section.number}. {section.title}</span>
                  <span>{isExpanded(section.id) ? '−' : '+'}</span>
                </div>
                {isExpanded(section.id) && (
                  <div style={contentStyle}>
                    {section.subsections ? (
                      // Section with subsections
                      section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h3 style={{ 
                            fontSize: '17px', 
                            fontWeight: 'bold', 
                            marginBottom: '12px',
                            marginTop: subIndex > 0 ? '20px' : '0',
                            color: 'var(--text-primary)'
                          }}>
                            {subsection.title}
                          </h3>
                          {Array.isArray(subsection.content) ? (
                            (() => {
                              // Group consecutive strings and objects into paragraphs
                              const paragraphs = [];
                              let currentParagraph = [];
                              
                              subsection.content.forEach((item, index) => {
                                if (typeof item === 'string') {
                                  currentParagraph.push(item);
                                } else if (item && typeof item === 'object') {
                                  if (item.list) {
                                    // Start new paragraph for lists
                                    if (currentParagraph.length > 0) {
                                      paragraphs.push({ type: 'text', content: currentParagraph });
                                      currentParagraph = [];
                                    }
                                    paragraphs.push({ type: 'list', content: item.list });
                                  } else if (item.bold) {
                                    // Start new paragraph for bold
                                    if (currentParagraph.length > 0) {
                                      paragraphs.push({ type: 'text', content: currentParagraph });
                                      currentParagraph = [];
                                    }
                                    paragraphs.push({ type: 'bold', content: item.bold });
                                  } else {
                                    currentParagraph.push(item);
                                  }
                                }
                                
                                // If we hit the end, finalize current
                                if (index === subsection.content.length - 1 && currentParagraph.length > 0) {
                                  paragraphs.push({ type: 'text', content: currentParagraph });
                                }
                              });
                              
                              return paragraphs.map((para, paraIndex) => {
                                if (para.type === 'text') {
                                  return (
                                    <p key={paraIndex} style={{ marginBottom: '12px' }}>
                                      {para.content.map((item, itemIndex) => {
                                        if (typeof item === 'string') {
                                          const parts = item.split(/(https?:\/\/[^\s]+|support@reformgym\.fit|donotreply@reformgym\.fit|American Arbitration Association \(AAA\) website)/g);
                                          return parts.map((part, partIndex) => {
                                            if (part.startsWith('http')) {
                                              return <a key={partIndex} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#3030F1' }}>{part}</a>;
                                            }
                                            if (part.includes('@')) {
                                              return <a key={partIndex} href={`mailto:${part}`} style={{ color: '#3030F1' }}>{part}</a>;
                                            }
                                            if (part === 'American Arbitration Association (AAA) website') {
                                              return <a key={partIndex} href="http://www.adr.org" target="_blank" rel="noopener noreferrer" style={{ color: '#3030F1' }}>{part}</a>;
                                            }
                                            return <span key={partIndex}>{part}</span>;
                                          });
                                        }
                                        if (item && typeof item === 'object') {
                                          if (item.link) {
                                            return <a key={itemIndex} href={item.link.url} style={{ color: '#3030F1' }}>{item.link.text}</a>;
                                          }
                                          if (item.email) {
                                            return <a key={itemIndex} href={`mailto:${item.email}`} style={{ color: '#3030F1' }}>{item.email}</a>;
                                          }
                                        }
                                        return null;
                                      })}
                                    </p>
                                  );
                                }
                                if (para.type === 'list') {
                                  return (
                                    <ul key={paraIndex} style={{ marginLeft: '20px', marginBottom: '12px' }}>
                                      {para.content.map((listItem, listIndex) => (
                                        <li key={listIndex}>{listItem}</li>
                                      ))}
                                    </ul>
                                  );
                                }
                                if (para.type === 'bold') {
                                  return (
                                    <p key={paraIndex} style={{ marginBottom: '12px' }}>
                                      <strong>{para.content}</strong>
                                    </p>
                                  );
                                }
                                return null;
                              });
                            })()
                          ) : (
                            <p style={{ marginBottom: '12px' }}>{subsection.content}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      // Section without subsections
                      Array.isArray(section.content) ? (
                        (() => {
                          // Group consecutive strings and objects into paragraphs
                          const paragraphs = [];
                          let currentParagraph = [];
                          
                          section.content.forEach((item, index) => {
                            if (typeof item === 'string') {
                              currentParagraph.push(item);
                            } else if (item && typeof item === 'object') {
                              if (item.list) {
                                // Start new paragraph for lists
                                if (currentParagraph.length > 0) {
                                  paragraphs.push({ type: 'text', content: currentParagraph });
                                  currentParagraph = [];
                                }
                                paragraphs.push({ type: 'list', content: item.list });
                              } else if (item.bold) {
                                // Start new paragraph for bold
                                if (currentParagraph.length > 0) {
                                  paragraphs.push({ type: 'text', content: currentParagraph });
                                  currentParagraph = [];
                                }
                                paragraphs.push({ type: 'bold', content: item.bold });
                              } else {
                                currentParagraph.push(item);
                              }
                            }
                            
                            // If we hit the end or next item would start a new paragraph, finalize current
                            if (index === section.content.length - 1 && currentParagraph.length > 0) {
                              paragraphs.push({ type: 'text', content: currentParagraph });
                            }
                          });
                          
                          return paragraphs.map((para, paraIndex) => {
                            if (para.type === 'text') {
                              return (
                                <p key={paraIndex} style={{ marginBottom: '12px' }}>
                                  {para.content.map((item, itemIndex) => {
                                    if (typeof item === 'string') {
                                      const parts = item.split(/(https?:\/\/[^\s]+|support@reformgym\.fit|donotreply@reformgym\.fit)/g);
                                      return parts.map((part, partIndex) => {
                                        if (part.startsWith('http')) {
                                          return <a key={partIndex} href={part} style={{ color: '#3030F1' }}>{part}</a>;
                                        }
                                        if (part.includes('@')) {
                                          return <a key={partIndex} href={`mailto:${part}`} style={{ color: '#3030F1' }}>{part}</a>;
                                        }
                                        return <span key={partIndex}>{part}</span>;
                                      });
                                    }
                                    if (item && typeof item === 'object') {
                                      if (item.link) {
                                        return <a key={itemIndex} href={item.link.url} style={{ color: '#3030F1' }}>{item.link.text}</a>;
                                      }
                                      if (item.email) {
                                        return <a key={itemIndex} href={`mailto:${item.email}`} style={{ color: '#3030F1' }}>{item.email}</a>;
                                      }
                                    }
                                    return null;
                                  })}
                                </p>
                              );
                            }
                            if (para.type === 'list') {
                              return (
                                <ul key={paraIndex} style={{ marginLeft: '20px', marginBottom: '12px' }}>
                                  {para.content.map((listItem, listIndex) => (
                                    <li key={listIndex}>{listItem}</li>
                                  ))}
                                </ul>
                              );
                            }
                            if (para.type === 'bold') {
                              return (
                                <p key={paraIndex} style={{ marginBottom: '12px' }}>
                                  <strong>{para.content}</strong>
                                </p>
                              );
                            }
                            return null;
                          });
                        })()
                      ) : (
                        <p style={{ marginBottom: '12px' }}>{section.content}</p>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </PageContainer>
  );
};

export default TermsPage;
