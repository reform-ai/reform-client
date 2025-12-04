# API Configuration Structure

This directory contains the domain-based organization of API endpoints.

## Structure

```
api/
├── base.js              # Base API URL configuration
├── core.js              # Core endpoints (upload, health, etc.)
├── auth.js              # Authentication endpoints
├── social.js            # Social feed endpoints
├── tokens.js            # Token endpoints
├── analysis.js          # Analysis endpoints
├── poseService.js       # Pose service endpoints
├── contact.js           # Contact endpoints
├── xIntegration.js      # X (Twitter) integration endpoints
├── workoutPlans.js      # Workout plan endpoints
├── expertCoaching.js    # Expert coaching endpoints
└── index.js             # Main export combining all domains
```

## Usage

**Import (unchanged from before):**
```javascript
import { API_ENDPOINTS, API_URL } from '../config/api';
```

All existing imports continue to work without any changes. The `api.js` file in the parent directory re-exports from this structure.

## Adding New Endpoints

1. **Find the appropriate domain file** (or create a new one if needed)
2. **Add the endpoint** to the domain's endpoint object
3. **The endpoint will automatically be available** in `API_ENDPOINTS`

Example:
```javascript
// In expertCoaching.js
export const expertCoachingEndpoints = {
  // ... existing endpoints
  EXPERT_COACHING_NEW_ENDPOINT: `${API_URL}/api/expert-coaching/new-endpoint`,
};
```

The new endpoint will be available as `API_ENDPOINTS.EXPERT_COACHING_NEW_ENDPOINT`.

## Benefits

- **Better organization**: Endpoints grouped by domain/feature
- **Easier to find**: Locate endpoints by feature area
- **Reduced conflicts**: Multiple developers can work on different domains
- **Maintainability**: Clear structure for adding new endpoints
- **Backward compatible**: All existing code continues to work

