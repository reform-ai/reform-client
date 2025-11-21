import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/api';
import { getUserToken } from '../../utils/authStorage';
import { formatDate } from '../../utils/dateFormat';

const CommentSection = ({ postId, currentUserId, currentUserEmail, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set()); // Track which comments have replies expanded

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.POST_COMMENTS(postId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.POST_COMMENTS(postId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        setNewComment('');
        loadComments();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.POST_COMMENTS(postId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText.trim(),
          parent_comment_id: parentCommentId,
        }),
      });

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        loadComments();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    const token = getUserToken();

    try {
      const response = await fetch(API_ENDPOINTS.COMMENT(commentId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadComments();
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };


  return (
    <div className="comment-section">
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="btn btn-primary"
          style={{
            marginTop: '8px',
            alignSelf: 'flex-end',
            padding: '8px 16px',
            fontSize: '0.9rem',
            opacity: (!newComment.trim() || isSubmitting) ? 0.5 : 1,
            cursor: (!newComment.trim() || isSubmitting) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="comments-list">
        {isLoading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <>
            {(() => {
              // Filter to only top-level comments (no parent_comment_id)
              const topLevelComments = comments.filter(c => !c.parent_comment_id);
              const commentsToShow = showAllComments ? topLevelComments : topLevelComments.slice(0, 3);
              
              return commentsToShow.map((comment, index) => {
                const baseIndent = 10;
                const canReply = true; // All top-level comments can have replies
                const hasReplies = comment.reply_count > 0; // Show button if there are any replies
                const isExpanded = expandedReplies.has(comment.id);
                
                // Find replies for this comment
                const commentReplies = comments.filter(c => c.parent_comment_id === comment.id);
            
                return (
                  <div key={comment.id}>
                    <div 
                      className="comment-item"
                      style={{
                        marginLeft: `${baseIndent}px`,
                        marginTop: index > 0 ? '12px' : '0'
                      }}
                    >
                  <div className="comment-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px', // Increased spacing between username and time
                    marginBottom: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="comment-username" style={{ fontWeight: '600' }}>
                        {comment.username || 'Unknown User'}
                      </span>
                      {comment.user_email && comment.user_email === process.env.REACT_APP_VERIFIED_EMAIL && (
                        <img 
                          src="https://images.credential.net/badge/tiny/kt0vexxs_1761580077325_badge.png" 
                          alt="Verified Badge" 
                          style={{
                            height: '18px',
                            width: 'auto',
                            verticalAlign: 'middle'
                          }}
                        />
                      )}
                    </div>
                    <span className="comment-time" style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem'
                    }}>
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="comment-content" style={{ 
                    margin: '0 0 8px 0',
                    lineHeight: '1.5',
                    fontStyle: comment.content === 'User deleted this comment' ? 'italic' : 'normal',
                    color: comment.content === 'User deleted this comment' ? 'var(--text-secondary)' : 'var(--text-primary)'
                  }}>
                    {comment.content}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {canReply && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: '4px 8px'
                        }}
                      >
                        Reply
                      </button>
                    )}
                      {hasReplies && (
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedReplies);
                            if (isExpanded) {
                              newExpanded.delete(comment.id);
                            } else {
                              newExpanded.add(comment.id);
                            }
                            setExpandedReplies(newExpanded);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '4px 8px'
                          }}
                        >
                          {isExpanded ? 'Hide' : `View ${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`}
                        </button>
                      )}
                    {comment.content !== 'User deleted this comment' && (
                      <button
                        className="comment-delete"
                        onClick={() => handleDelete(comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-orange)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: '4px 8px'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <div style={{ marginTop: '12px', marginLeft: '20px' }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={!replyText.trim() || isSubmittingReply}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            background: 'var(--accent-green)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (!replyText.trim() || isSubmittingReply) ? 'not-allowed' : 'pointer',
                            opacity: (!replyText.trim() || isSubmittingReply) ? 0.5 : 1
                          }}
                        >
                          {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          disabled={isSubmittingReply}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            cursor: isSubmittingReply ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                    </div>
                    
                    {/* Show replies if expanded */}
                    {isExpanded && commentReplies.map((reply, replyIndex) => {
                      const replyIndent = baseIndent + 10;
                      return (
                        <div 
                          key={reply.id}
                          className="comment-item"
                          style={{
                            marginLeft: `${replyIndent}px`,
                            marginTop: '12px',
                            paddingLeft: '12px',
                            borderLeft: '2px solid var(--border-color)'
                          }}
                        >
                          <div className="comment-header" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '6px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="comment-username" style={{ fontWeight: '600' }}>
                                {reply.username || 'Unknown User'}
                              </span>
                              {reply.user_email && reply.user_email === process.env.REACT_APP_VERIFIED_EMAIL && (
                                <img 
                                  src="https://images.credential.net/badge/tiny/kt0vexxs_1761580077325_badge.png" 
                                  alt="Verified Badge" 
                                  style={{
                                    height: '18px',
                                    width: 'auto',
                                    verticalAlign: 'middle'
                                  }}
                                />
                              )}
                            </div>
                            <span className="comment-time" style={{ 
                              color: 'var(--text-secondary)',
                              fontSize: '0.85rem'
                            }}>
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                            <p className="comment-content" style={{ 
                              margin: '0 0 8px 0',
                              lineHeight: '1.5',
                              fontStyle: reply.content === 'User deleted this comment' ? 'italic' : 'normal',
                              color: reply.content === 'User deleted this comment' ? 'var(--text-secondary)' : 'var(--text-primary)'
                            }}>
                              {reply.content}
                            </p>
                            {reply.content !== 'User deleted this comment' && (
                              <button
                                className="comment-delete"
                                onClick={() => handleDelete(reply.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-orange)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  padding: '4px 8px'
                                }}
                              >
                                Delete
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
            {(() => {
              const topLevelComments = comments.filter(c => !c.parent_comment_id);
              if (topLevelComments.length > 3 && !showAllComments) {
                return (
                  <button
                    onClick={() => setShowAllComments(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '8px 0',
                      marginTop: '8px',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    ... Show {topLevelComments.length - 3} more {topLevelComments.length - 3 === 1 ? 'comment' : 'comments'}
                  </button>
                );
              }
              if (topLevelComments.length > 3 && showAllComments) {
                return (
                  <button
                    onClick={() => setShowAllComments(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '8px 0',
                      marginTop: '8px',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Show less
                  </button>
                );
              }
              return null;
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

