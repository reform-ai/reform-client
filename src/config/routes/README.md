# Route Configuration

This directory contains the route configuration for the Reform Client application. Routes are organized by type to make it easy to understand the application structure and add new routes.

## Structure

```
config/routes/
├── publicRoutes.js      # Public routes (no authentication required)
├── protectedRoutes.js   # Protected routes (authentication required)
├── featureRoutes.js     # Feature-based routes (organized by feature)
├── index.js             # Main entry point (combines all routes)
└── README.md            # This file
```

## Route Types

### Public Routes (`publicRoutes.js`)

Routes accessible to all users (logged in or not):
- Landing page (`/`)
- Sign up (`/signup`)
- Contact (`/contact`)
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)
- Email verification (`/verify-email`)
- OAuth callbacks (`/auth/x/callback`)

### Protected Routes (`protectedRoutes.js`)

Routes that require user authentication:
- Dashboard (`/dashboard`)
- Profile (`/profile`, `/profile/:username`)
- Feed (`/feed`)
- Followers (`/followers`)
- Tokens (`/tokens`, `/tokens/history`)
- Progress Dashboard (`/progress`)

**Note:** These routes should use the `useRequireAuth` hook in their components to enforce authentication.

### Feature Routes (`featureRoutes.js`)

Routes organized by feature, following the feature-based organization pattern:

#### Analysis Feature
- `/analyses` - Analysis history
- `/analyses/:analysisId` - Analysis detail

#### Workout Plans Feature
- `/workout-plans/questionnaire` - Questionnaire
- `/workout-plans/generate` - Generate plan
- `/workout-plans/:planId` - View plan
- `/workout-plans` - Default plan view

#### Expert Coaching Feature
- `/expert-coaching` - Main page
- `/expert-coaching/voucher` - Voucher redemption
- `/expert-coaching/request` - Request consultation
- `/expert-coaching/consultations` - User consultations
- `/expert-coaching/consultations/:consultationId/book` - Book consultation
- `/expert-coaching/consultations/:consultationId` - Consultation detail
- `/pt/expert-coaching/consultations` - PT consultations list
- `/pt/expert-coaching/consultations/:consultationId` - PT consultation detail

## Route Configuration Format

Each route is an object with the following properties:

```javascript
{
  path: '/route/path',           // Route path (supports React Router params)
  element: Component,            // React component to render
  title: 'Page Title',            // Page title (for future use)
  requiresAuth: true,            // Whether authentication is required
  feature: 'feature-name'        // Feature name (for feature routes only)
}
```

## Adding New Routes

### Adding a Public Route

1. Open `publicRoutes.js`
2. Import your component at the top
3. Add a route object to the `publicRoutes` array:

```javascript
{
  path: '/new-public-route',
  element: NewPublicComponent,
  title: 'New Public Page',
  requiresAuth: false
}
```

### Adding a Protected Route

1. Open `protectedRoutes.js`
2. Import your component at the top
3. Add a route object to the `protectedRoutes` array:

```javascript
{
  path: '/new-protected-route',
  element: NewProtectedComponent,
  title: 'New Protected Page',
  requiresAuth: true
}
```

**Important:** Make sure your component uses `useRequireAuth` hook:

```javascript
import { useRequireAuth } from '../shared/utils/useRequireAuth';

const NewProtectedComponent = () => {
  const navigate = useNavigate();
  useRequireAuth(navigate);
  // ... rest of component
};
```

### Adding a Feature Route

1. Open `featureRoutes.js`
2. Import your component at the top
3. Add a route object to the `featureRoutes` array:

```javascript
{
  path: '/feature-name/new-route',
  element: NewFeatureComponent,
  title: 'New Feature Page',
  requiresAuth: true,
  feature: 'feature-name'
}
```

**Best Practice:** Keep feature routes organized by feature. Group related routes together with comments.

## Using Routes in Components

Routes are automatically registered in `App.jsx`. To access route information programmatically:

```javascript
import { getRouteByPath, getRoutesByFeature } from '../config/routes';

// Get a specific route
const route = getRouteByPath('/dashboard');

// Get all routes for a feature
const analysisRoutes = getRoutesByFeature('analysis');
```

## Route Metadata

The route configuration includes metadata that can be used for:

- **Document titles:** Set `document.title` based on route
- **Breadcrumbs:** Generate breadcrumb navigation
- **Route guards:** Implement authentication checks (future)
- **Analytics:** Track page views by route
- **Navigation menus:** Generate navigation menus dynamically

## Future Enhancements

Potential future improvements:

1. **Route Guards:** Implement route-level authentication guards
2. **Route Permissions:** Add role-based access control (e.g., admin routes)
3. **Route Metadata:** Add more metadata (icons, descriptions, etc.)
4. **Dynamic Route Loading:** Lazy load routes for better performance
5. **Route Analytics:** Track route usage and performance

## Best Practices

1. **Keep routes organized:** Place routes in the appropriate file (public, protected, or feature)
2. **Use descriptive titles:** Titles should clearly describe the page
3. **Follow naming conventions:** Use kebab-case for paths, PascalCase for components
4. **Group related routes:** Keep feature routes together with comments
5. **Document complex routes:** Add comments for routes with special behavior
6. **Test route changes:** Verify routes work after adding or modifying

## Migration Notes

Routes were migrated from `App.jsx` to this configuration system. The route paths and components remain unchanged, ensuring backward compatibility.

