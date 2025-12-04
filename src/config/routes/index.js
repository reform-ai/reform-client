/**
 * Route Configuration Index
 * 
 * Combines all route configurations into a single export.
 * This is the main entry point for route configuration.
 * 
 * Route metadata:
 * - path: Route path (supports React Router params like :id)
 * - element: React component to render
 * - title: Page title (for future use in document.title or breadcrumbs)
 * - requiresAuth: Whether route requires authentication (for future route guards)
 * - feature: Feature name (for feature-based routes)
 */

import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { featureRoutes } from './featureRoutes';

/**
 * All application routes combined
 * @type {Array<{path: string, element: React.Component, title?: string, requiresAuth?: boolean, feature?: string}>}
 */
export const routes = [
  ...publicRoutes,
  ...protectedRoutes,
  ...featureRoutes
];

/**
 * Get route by path
 * @param {string} path - Route path to find
 * @returns {Object|undefined} Route configuration or undefined
 */
export const getRouteByPath = (path) => {
  return routes.find(route => route.path === path);
};

/**
 * Get all routes for a specific feature
 * @param {string} featureName - Feature name (e.g., 'analysis', 'expert-coaching')
 * @returns {Array<Object>} Routes for the feature
 */
export const getRoutesByFeature = (featureName) => {
  return featureRoutes.filter(route => route.feature === featureName);
};

/**
 * Get all public routes
 * @returns {Array<Object>} Public routes
 */
export const getPublicRoutes = () => publicRoutes;

/**
 * Get all protected routes
 * @returns {Array<Object>} Protected routes
 */
export const getProtectedRoutes = () => protectedRoutes;

/**
 * Get all feature routes
 * @returns {Array<Object>} Feature routes
 */
export const getFeatureRoutes = () => featureRoutes;

// Export individual route arrays for convenience
export { publicRoutes, protectedRoutes, featureRoutes };

