/**
 * Protected Routes Configuration
 * 
 * Routes that require user authentication.
 * These routes should use the useRequireAuth hook in their components.
 */

import DashboardPage from '../../pages/DashboardPage';
import DashboardAnalyze from '../../pages/DashboardAnalyze';
import ProfilePage from '../../pages/ProfilePage';
import UserProfilePage from '../../pages/UserProfilePage';
import FeedPage from '../../pages/FeedPage';
import FollowersPage from '../../pages/FollowersPage';
import TokensPage from '../../pages/TokensPage';
import TransactionHistoryPage from '../../pages/TransactionHistoryPage';
import ProgressDashboardPage from '../../pages/ProgressDashboardPage';

/**
 * Protected routes configuration
 * @type {Array<{path: string, element: React.Component, title?: string, requiresAuth?: boolean}>}
 */
export const protectedRoutes = [
  {
    path: '/dashboard',
    element: DashboardPage,
    title: 'Dashboard',
    requiresAuth: true
  },
  {
    path: '/dashboard/analyze',
    element: DashboardAnalyze,
    title: 'Analyze',
    requiresAuth: true
  },
  {
    path: '/profile',
    element: ProfilePage,
    title: 'My Profile',
    requiresAuth: true
  },
  {
    path: '/profile/:username',
    element: UserProfilePage,
    title: 'User Profile',
    requiresAuth: true
  },
  {
    path: '/feed',
    element: FeedPage,
    title: 'Feed',
    requiresAuth: true
  },
  {
    path: '/followers',
    element: FollowersPage,
    title: 'Followers',
    requiresAuth: true
  },
  {
    path: '/tokens',
    element: TokensPage,
    title: 'Tokens',
    requiresAuth: true
  },
  {
    path: '/tokens/history',
    element: TransactionHistoryPage,
    title: 'Transaction History',
    requiresAuth: true
  },
  {
    path: '/progress',
    element: ProgressDashboardPage,
    title: 'Progress Dashboard',
    requiresAuth: true
  }
];

