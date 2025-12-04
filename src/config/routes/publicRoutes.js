/**
 * Public Routes Configuration
 * 
 * Routes that are accessible without authentication.
 * These routes are available to all users (logged in or not).
 */

import LandingPage from '../../pages/LandingPage';
import SignupPage from '../../pages/SignupPage';
import ContactPage from '../../pages/ContactPage';
import PrivacyPage from '../../pages/PrivacyPage';
import TermsPage from '../../pages/TermsPage';
import VerifyEmailPage from '../../pages/VerifyEmailPage';
import XOAuthCallbackPage from '../../pages/XOAuthCallbackPage';

/**
 * Public routes configuration
 * @type {Array<{path: string, element: React.Component, title?: string, requiresAuth?: boolean}>}
 */
export const publicRoutes = [
  {
    path: '/',
    element: LandingPage,
    title: 'Home',
    requiresAuth: false
  },
  {
    path: '/signup',
    element: SignupPage,
    title: 'Sign Up',
    requiresAuth: false
  },
  {
    path: '/contact',
    element: ContactPage,
    title: 'Contact',
    requiresAuth: false
  },
  {
    path: '/privacy',
    element: PrivacyPage,
    title: 'Privacy Policy',
    requiresAuth: false
  },
  {
    path: '/terms',
    element: TermsPage,
    title: 'Terms of Service',
    requiresAuth: false
  },
  {
    path: '/verify-email',
    element: VerifyEmailPage,
    title: 'Verify Email',
    requiresAuth: false
  },
  {
    path: '/auth/x/callback',
    element: XOAuthCallbackPage,
    title: 'X OAuth Callback',
    requiresAuth: false
  }
];

