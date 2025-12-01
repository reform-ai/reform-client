import React from 'react';
import '../../styles/landing/LandingComponents.css';

/**
 * BenefitsSection - Benefits/Why Choose section
 */
const BenefitsSection = () => {
  const benefits = [
    {
      number: '01',
      title: 'AI-Powered',
      description: 'Advanced AI technology provides accurate form analysis and personalized insights'
    },
    {
      number: '02',
      title: 'Detailed Insights',
      description: 'Get comprehensive breakdowns of your form with scores for multiple components'
    },
    {
      number: '03',
      title: 'Track Progress',
      description: 'Monitor your improvement over time with detailed analysis history and trends'
    },
    {
      number: '04',
      title: 'Expert Guidance',
      description: 'Access AI-powered coaching and personalized workout plans tailored to your goals'
    }
  ];

  return (
    <section className="benefits-section">
      <div className="benefits-container">
        <h2 className="benefits-title">Why Choose Reform?</h2>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <div className="benefit-number">{benefit.number}</div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

