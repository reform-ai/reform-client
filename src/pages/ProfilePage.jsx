import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetchJson } from '../shared/utils/authenticatedFetch';
import PageHeader from '../shared/components/layout/PageHeader';
import PageContainer from '../shared/components/layout/PageContainer';
import VerificationBanner from '../shared/components/verification/VerificationBanner';
import SendVerificationEmailModal from '../shared/components/modals/SendVerificationEmailModal';
import PasswordChangeSection from '../shared/components/profile/PasswordChangeSection';
import UsernameEditor from '../shared/components/profile/UsernameEditor';
import PrivacyToggle from '../shared/components/profile/PrivacyToggle';
import ProfileAttributes from '../shared/components/profile/ProfileAttributes';
import TokenActivationSection from '../shared/components/profile/TokenActivationSection';
import '../shared/styles/AnalysisSkeleton.css';
import './DashboardPage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isTokenActivated, setIsTokenActivated] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const checkTokenActivationStatus = useCallback(async () => {
    try {
      const data = await authenticatedFetchJson(API_ENDPOINTS.TOKEN_BALANCE, {}, navigate);
        setIsTokenActivated(data.is_activated !== false);
    } catch (err) {
      console.error('Failed to check token activation status:', err);
    }
  }, [navigate]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const [userData, privacyData] = await Promise.allSettled([
        authenticatedFetchJson(API_ENDPOINTS.ME, {}, navigate),
        authenticatedFetchJson(API_ENDPOINTS.PRIVACY, {}, navigate).catch(() => null)
      ]);

      if (userData.status === 'fulfilled') {
        const data = userData.value;
      setUserInfo(data);
      } else {
        throw new Error(userData.reason?.message || 'Failed to load profile information');
      }
      
      if (privacyData.status === 'fulfilled' && privacyData.value) {
        setIsPublic(privacyData.value.is_public);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserInfo();
    checkTokenActivationStatus();
    
    if (searchParams.get('verified') === 'true') {
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 5000);
      navigate('/profile', { replace: true });
    }
  }, [fetchUserInfo, checkTokenActivationStatus, searchParams, navigate]);

  const handleUserInfoUpdate = (updatedInfo) => {
    setUserInfo(updatedInfo);
  };

  const handlePrivacyUpdate = (newPrivacyValue) => {
    setIsPublic(newPrivacyValue);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error && !userInfo) {
    return (
      <PageContainer>
        <PageHeader onLoginClick={() => navigate('/?login=1')} />
        <div className="skeleton-shell">
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0'
          }}>
            <div className="skeleton-card" style={{ maxWidth: '500px', width: '100%' }}>
              <p style={{ color: 'var(--accent-orange)', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">User Profile</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 className="skeleton-title" style={{ margin: 0, fontSize: '1.5rem' }}>
                {userInfo?.full_name || 'Profile'}
              </h1>
              {userInfo?.is_pt && (
                <img 
                  src="https://images.credential.net/badge/tiny/kt0vexxs_1761580077325_badge.png" 
                  alt="Verified Personal Trainer" 
                  style={{
                    height: '32px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
          </div>
        </header>

        {userInfo && !userInfo.is_verified && (
          <VerificationBanner onVerificationComplete={fetchUserInfo} />
        )}

        {verificationSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid var(--accent-green)',
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 0',
            color: 'var(--accent-green)',
            textAlign: 'center'
          }}>
            ✅ Email verified successfully! You can now use all social features.
          </div>
        )}

        <div className="skeleton-grid">
          <article className="skeleton-card">
            <h3>Account Information</h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '8px'
          }}>
            Full Name
          </label>
          <div style={{
            padding: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}>
            {userInfo?.full_name}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '8px'
          }}>
            Email
          </label>
          <div style={{
            padding: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}>
            {userInfo?.email}
          </div>
        </div>

            <UsernameEditor 
              userInfo={userInfo} 
              navigate={navigate} 
              onUpdate={handleUserInfoUpdate}
            />

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '8px'
          }}>
            Email Verification Status
          </label>
          <div style={{
            padding: '12px',
            background: userInfo?.is_verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${userInfo?.is_verified ? 'var(--accent-green)' : 'var(--accent-orange)'}`,
            borderRadius: '8px',
            color: userInfo?.is_verified ? 'var(--accent-green)' : 'var(--accent-orange)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {userInfo?.is_verified ? '✅ Verified' : '❌ Unverified'}
            {!userInfo?.is_verified && (
              <span style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>
                <button
                  onClick={() => setShowVerificationModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-green)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                >
                  Verify now
                </button>
              </span>
            )}
          </div>
        </div>

            <TokenActivationSection 
              isTokenActivated={isTokenActivated}
              onActivationComplete={setIsTokenActivated}
            />

            <PasswordChangeSection navigate={navigate} />
          </article>

          <article className="skeleton-card">
            <h3 style={{ margin: '0 0 20px 0' }}>Account Settings</h3>
            
            <PrivacyToggle 
              isPublic={isPublic}
              navigate={navigate}
              onUpdate={handlePrivacyUpdate}
            />

            <ProfileAttributes 
              userInfo={userInfo}
              navigate={navigate}
              onUpdate={handleUserInfoUpdate}
            />
          </article>
        </div>
      </div>

      {showVerificationModal && (
        <SendVerificationEmailModal
          onClose={() => setShowVerificationModal(false)}
          onSuccess={() => {
            setShowVerificationModal(false);
            fetchUserInfo();
          }}
        />
      )}
    </PageContainer>
  );
}

export default ProfilePage;
