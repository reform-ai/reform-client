import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { getUserToken, isUserLoggedIn } from '../shared/utils/authStorage';
import PageContainer from '../shared/components/layout/PageContainer';
import PageHeader from '../shared/components/layout/PageHeader';
import '../shared/styles/AnalysisSkeleton.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect if not logged in (optional - you might want to allow anonymous contact)
  // For now, let's allow anonymous contact but pre-fill email if logged in
  React.useEffect(() => {
    if (isUserLoggedIn()) {
      // Optionally fetch user info to pre-fill
      const fetchUserInfo = async () => {
        try {
          const token = getUserToken();
          const response = await fetch(API_ENDPOINTS.ME, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setFormData(prev => ({
              ...prev,
              name: userData.full_name || prev.name,
              email: userData.email || prev.email
            }));
          }
        } catch (err) {
          // Silently fail - user can still fill form manually
        }
      };
      fetchUserInfo();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const token = getUserToken(); // May be null if not logged in
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Include auth token if available (optional)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.CONTACT_SUBMIT, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send message');
      }

      setSuccess(data.message || 'Your message has been sent successfully!');
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader onLoginClick={() => navigate('/?login=1')} />
      
      <div className="skeleton-shell">
        <header className="skeleton-header">
          <div>
            <p className="skeleton-eyebrow">Support</p>
            <h1 className="skeleton-title">Contact Us</h1>
            <p className="skeleton-subtitle">
              Have a question or need help? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </header>

        <article className="skeleton-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {success && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '20px',
                background: 'var(--accent-green)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                {success}
              </div>
            )}

            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '20px',
                background: 'var(--accent-orange)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="name" style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={1}
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="subject" style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                minLength={1}
                maxLength={200}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="message" style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                marginTop: '4px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                textAlign: 'right'
              }}>
                {formData.message.length} / 2000 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            <p style={{
              marginTop: '16px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              We typically respond within 24-48 hours.
            </p>
          </form>
        </article>
      </div>
    </PageContainer>
  );
};

export default ContactPage;

