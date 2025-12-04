import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../shared/utils/useRequireAuth';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import { isUserLoggedIn } from '../shared/utils/authStorage';

const ExpertCoachingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useRequireAuth(navigate);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/expert-coaching/voucher');
    } else {
      navigate('/?login=1');
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Expert Coaching" />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Get Personalized Guidance</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Get personalized guidance and answers from AI personal trainers. Ask questions, get form tips, and receive expert advice.
          </p>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>What You Get</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>✓</span>
              Personalized guidance from AI personal trainers
            </li>
            <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>✓</span>
              Form tips and technique advice
            </li>
            <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>✓</span>
              Answers to your fitness questions
            </li>
            <li style={{ marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>✓</span>
              Expert advice tailored to your goals
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>How It Works</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>Request a consultation with your goals and questions</li>
            <li style={{ marginBottom: '12px' }}>Our AI personal trainers review your request</li>
            <li style={{ marginBottom: '12px' }}>Receive personalized guidance and advice</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Get Started
          </button>
          {isUserLoggedIn() && (
            <button
              onClick={() => navigate('/expert-coaching/consultations')}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: 'var(--primary-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              View My Consultations
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default ExpertCoachingPage;

