import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import FollowButton from '../shared/components/social/FollowButton';

const FollowersPage = () => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await authenticatedFetchJson(API_ENDPOINTS.MY_FOLLOWERS, {}, navigate);
      setFollowers(data.followers || []);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError(err.message || 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchFollowing = useCallback(async () => {
    setFollowingLoading(true);

    try {
      const data = await authenticatedFetchJson(API_ENDPOINTS.MY_FOLLOWING, {}, navigate);
      setFollowing(data.followers || []);
    } catch (err) {
      console.error('Error fetching following:', err);
      // Don't set error state for following, just log it
    } finally {
      setFollowingLoading(false);
    }
  }, [navigate]);

  const initializePage = useCallback(() => {
    fetchFollowers();
    fetchFollowing();
  }, [fetchFollowers, fetchFollowing]);

  useRequireAuth(navigate, initializePage);

  const handleUserClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const handleFollowUpdate = (username, isFollowing) => {
    // Update the is_following_back status when follow status changes in followers list
    setFollowers(prev => prev.map(f => 
      f.username === username ? { ...f, is_following_back: isFollowing } : f
    ));
    
    // If unfollowing, remove from following list
    if (!isFollowing) {
      setFollowing(prev => prev.filter(f => f.username !== username));
    }
  };

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Social</p>
            <h1 className="skeleton-title">Followers</h1>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <article className="skeleton-card">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading followers...</p>
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--accent-orange)' }}>
                <p>{error}</p>
              </div>
            ) : followers.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>You don't have any followers yet.</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
                  Share posts to get followers!
                </p>
              </div>
            ) : (
              <div style={{ padding: '20px' }}>
                <h3 style={{ 
                  marginBottom: '8px', 
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Followers
                </h3>
                <p style={{ 
                  marginBottom: '16px', 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {followers.map((follower) => (
                    <div
                      key={follower.id || follower.user_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        gap: '12px'
                      }}
                    >
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          flex: 1,
                          cursor: follower.username ? 'pointer' : 'default'
                        }}
                        onClick={() => handleUserClick(follower.username)}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--accent-green)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            flexShrink: 0
                          }}
                        >
                          {follower.full_name 
                            ? follower.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                            : 'U'
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: 600, 
                            color: 'var(--text-primary)',
                            marginBottom: '2px'
                          }}>
                            {follower.username || 'Unknown User'}
                          </div>
                          {follower.full_name && (
                            <div style={{ 
                              fontSize: '0.85rem', 
                              color: 'var(--text-secondary)'
                            }}>
                              {follower.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                      {follower.username && (
                        <FollowButton
                          username={follower.username}
                          initialFollowing={follower.is_following_back}
                          onUpdate={(following) => handleFollowUpdate(follower.username, following)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Following Section - People you follow */}
          {!followingLoading && !error && following.length > 0 && (
              <article className="skeleton-card">
                <div style={{ padding: '20px' }}>
                  <h3 style={{ 
                    marginBottom: '8px', 
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}>
                    Following
                  </h3>
                  <p style={{ 
                    marginBottom: '16px', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {following.length} {following.length === 1 ? 'person' : 'people'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {following.map((user) => (
                      <div
                        key={user.id || user.user_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          gap: '12px'
                        }}
                      >
                        <div 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            flex: 1,
                            cursor: user.username ? 'pointer' : 'default'
                          }}
                          onClick={() => handleUserClick(user.username)}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'var(--accent-green)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              flexShrink: 0
                            }}
                          >
                            {user.full_name 
                              ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                              : 'U'
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontWeight: 600, 
                              color: 'var(--text-primary)',
                              marginBottom: '2px'
                            }}>
                              {user.username || 'Unknown User'}
                            </div>
                            {user.full_name && (
                              <div style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--text-secondary)'
                              }}>
                                {user.full_name}
                              </div>
                            )}
                          </div>
                        </div>
                        {user.username && (
                          <FollowButton
                            username={user.username}
                            initialFollowing={true}
                            onUpdate={(isFollowing) => handleFollowUpdate(user.username, isFollowing)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )}
        </div>
      </div>
    </PageContainer>
  );
};

export default FollowersPage;

