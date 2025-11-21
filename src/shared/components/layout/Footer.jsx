import React from 'react';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <span>Copyright © {currentYear}</span>
        <span className="footer-separator">|</span>
        <span>All Rights Reserved</span>
        <span className="footer-separator">|</span>
        <a href="/terms" className="footer-link">Terms and Conditions</a>
        <span className="footer-separator">|</span>
        <a href="/privacy" className="footer-link">Privacy Policy</a>
        <span className="footer-separator">|</span>
        <a href="/contact" className="footer-link">Contact us</a>
      </div>
    </footer>
  );
};

export default Footer;

