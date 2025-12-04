import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import PostCard from '../shared/components/social/PostCard';
import CreatePostModal from '../shared/components/modals/CreatePostModal';
import VerificationBanner from '../shared/components/verification/VerificationBanner';
import { API_ENDPOINTS } from '../config/api';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import { PAGINATION } from '../shared/constants/app';
import '../shared/styles/AnalysisSkeleton.css';
import './FeedPage.css';

const FeedPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(PAGINATION.DEFAULT_OFFSET);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isVerified, setIsVerified] = useState(true);
  const limit = PAGINATION.DEFAULT_LIMIT;

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await authenticatedFetchJson(API_ENDPOINTS.ME, {}, navigate);
        setCurrentUserId(userData.id);
        setCurrentUserEmail(userData.email);
        setIsVerified(userData.is_verified || false);
    } catch (err) {
      console.warn('Failed to fetch current user:', err);
    }
  }, [navigate]);

  const loadFeed = useCallback(async (reset = false) => {
    setLoading(true);
    setError('');

    try {
      const currentOffset = reset ? 0 : offset;
      const data = await authenticatedFetchJson(
        `${API_ENDPOINTS.FEED}?limit=${limit}&offset=${currentOffset}`,
        {},
        navigate
      );
      
      if (reset) {
        setPosts(data.posts);
        setOffset(data.posts.length);
      } else {
        setPosts(prev => {
          // Prevent duplicates by checking post IDs
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.posts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setOffset(prev => prev + data.posts.length);
      }
      
      setHasMore(data.has_more);
    } catch (err) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [offset, limit, navigate]);

  const initializePage = useCallback(() => {
    fetchCurrentUser();
    loadFeed(true);
  }, [fetchCurrentUser, loadFeed]);

  useRequireAuth(navigate, initializePage);

  const handleRefresh = () => {
    setOffset(0);
    loadFeed(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFeed();
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    handleRefresh();
  };

  const handlePostUpdate = () => {
    // Refresh the feed to get updated like/comment counts
    loadFeed(true);
  };

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Community</p>
            <h1 className="skeleton-title">Feed</h1>
            <p className="skeleton-subtitle">See what the community is sharing</p>
          </div>
          <div className="hero-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowCreatePost(true)}
            >
              Create Post
            </button>
          </div>
        </header>

        {/* Verification Banner */}
        {!isVerified && (
          <VerificationBanner onVerificationComplete={() => {
            fetchCurrentUser();
            loadFeed(true);
          }} />
        )}

        <div className="feed-content">
          {error && (
            <div className="feed-error">
              <p>{error}</p>
              <button onClick={handleRefresh} className="btn btn-secondary">
                Retry
              </button>
            </div>
          )}

          {loading && posts.length === 0 ? (
            <div className="feed-loading">
              <p>Loading feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="feed-empty">
              <p>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            <>
              <div className="posts-container">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    currentUserId={currentUserId}
                    currentUserEmail={currentUserEmail}
                    onUpdate={handlePostUpdate}
                    onDelete={handleRefresh}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="feed-load-more">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="btn btn-secondary"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreatePost && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </PageContainer>
  );
};

export default FeedPage;

