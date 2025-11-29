import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import '../shared/styles/AnalysisSkeleton.css';

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Legal</p>
            <h1 className="skeleton-title">Privacy Policy</h1>
            <p className="skeleton-subtitle">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <article className="skeleton-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ padding: '32px' }}>
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                Introduction
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                At Reform, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our service.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                Information We Collect
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                We collect information that you provide directly to us, including:
              </p>
              <ul style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li>Name and email address when you create an account</li>
                <li>Profile information such as username, technical level, and preferences</li>
                <li>Video uploads and analysis data</li>
                <li>Messages sent through our contact form</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                How We Use Your Information
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                We use the information we collect to:
              </p>
              <ul style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li>Provide, maintain, and improve our services</li>
                <li>Process your video analysis requests</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                Information Sharing
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information only in the following circumstances:
              </p>
              <ul style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in operating our platform</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                Data Security
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the Internet is 100% secure.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                Your Rights
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                You have the right to:
              </p>
              <ul style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                marginLeft: '24px',
                marginBottom: '16px'
              }}>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}>
                Contact Us
              </h2>
              <p style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a 
                  href="/contact" 
                  style={{ 
                    color: 'var(--accent-green)', 
                    textDecoration: 'underline' 
                  }}
                >
                  support@reformgym.fit
                </a> or through our{' '}
                <a 
                  href="/contact" 
                  style={{ 
                    color: 'var(--accent-green)', 
                    textDecoration: 'underline' 
                  }}
                >
                  contact form
                </a>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </PageContainer>
  );
};

export default PrivacyPage;

