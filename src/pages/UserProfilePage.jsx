import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { getUserToken, isUserLoggedIn } from '../shared/utils/authStorage';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import PostCard from '../shared/components/social/PostCard';
import FollowButton from '../shared/components/social/FollowButton';

/**
 * UserProfilePage - Displays a public user profile
 * 
 * Privacy rules implemented:
 * 1. full_name and email are NEVER shown
 * 2. username and preferences (technical_level, favorite_exercise, community_preference) are always visible
 * 3. posts are only shown if user is public OR if current user follows them
 */
const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoggedIn = isUserLoggedIn();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = getUserToken();
      if (!token) {
        navigate('/?login=1');
        return;
      }

      const response = await fetch(API_ENDPOINTS.USER_PROFILE(username), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.detail || 'Failed to load profile');
        }
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [username, navigate]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/?login=1');
      return;
    }

    fetchProfile();
  }, [isLoggedIn, navigate, fetchProfile]);


  const handlePostUpdate = () => {
    // Refresh profile to get updated post data
    fetchProfile();
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--accent-orange)' }}>{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/feed')}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            Back to Feed
          </button>
        </div>
      </PageContainer>
    );
  }

  // Format preference answers
  const preferences = [
    profile.technical_level && `Level: ${profile.technical_level}`,
    profile.favorite_exercise && `Favorite: ${profile.favorite_exercise}`,
    profile.community_preference && `Community: ${profile.community_preference}`
  ].filter(Boolean);

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Profile Header */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h1 style={{
                  margin: 0,
                  color: 'var(--text-primary)',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}>
                  @{profile.username}
                </h1>
                {profile.is_pt && (
                  <img 
                    src="https://images.credential.net/badge/tiny/kt0vexxs_1761580077325_badge.png" 
                    alt="Certified Personal Trainer" 
                    style={{
                      height: '24px',
                      width: 'auto',
                      verticalAlign: 'middle'
                    }}
                  />
                )}
              </div>
              {preferences.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {preferences.map((pref, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <FollowButton
              username={profile.username}
              initialFollowing={null}
              onUpdate={handlePostUpdate}
            />
          </div>

          {/* Privacy and PT indicators */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '8px 12px',
              background: profile.is_public ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
              border: `1px solid ${profile.is_public ? 'var(--accent-green)' : 'var(--accent-orange)'}`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'inline-block'
            }}>
              {profile.is_public ? '🌐 Public Profile' : '🔒 Private Profile'}
            </div>
            {profile.is_pt && (
              <div style={{
                padding: '8px 12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid var(--accent-blue)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'inline-block'
              }}>
                Certified Personal Trainer
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        {profile.can_see_posts ? (
          <div>
            <h2 style={{
              margin: '0 0 16px 0',
              color: 'var(--text-primary)',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              Posts
            </h2>
            {profile.posts && profile.posts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {profile.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdate={handlePostUpdate}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-secondary)'
              }}>
                <p>No posts yet</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              This user's posts are private. Follow them to see their posts.
            </p>
            <FollowButton
              username={profile.username}
              initialFollowing={false}
              onUpdate={handlePostUpdate}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default UserProfilePage;

