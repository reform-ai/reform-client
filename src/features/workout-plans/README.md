# Workout Plans Feature

This directory contains all code related to the Workout Plans feature, organized in a feature-based structure.

## Structure

```
workout-plans/
├── components/          # Feature-specific React components
├── pages/              # Feature-specific page components
├── utils/              # Feature-specific utilities (currently empty)
├── index.js            # Main export file
└── README.md           # This file
```

## Components

All workout-plans specific components:
- `WorkoutCalendar` - Calendar component for selecting workout days
- `DailyView` - Daily workout view component
- `WeeklyView` - Weekly workout view component
- `ViewModeSelector` - View mode selector component

## Pages

All workout-plans page components:
- `WorkoutPlanQuestionnairePage` - Questionnaire page
- `WorkoutPlanGeneratePage` - Plan generation page
- `WorkoutPlanViewerPage` - Plan viewer page

## Usage

### Importing Components

```jsx
// Import from feature index
import { WorkoutCalendar, DailyView } from '../features/workout-plans';

// Or import directly
import WorkoutCalendar from '../features/workout-plans/components/WorkoutCalendar';
```

### Importing Pages

```jsx
// Import directly (pages are typically used in routing)
import WorkoutPlanViewerPage from '../features/workout-plans/pages/WorkoutPlanViewerPage';
```

## Dependencies

This feature depends on:
- `shared/utils/authenticatedFetch` - API request utilities
- `shared/utils/dateFormat` - Date formatting utilities
- `shared/components/layout/` - Layout components
- `config/api/workoutPlans.js` - API endpoints

## Related Documentation

- [Component Catalog](../../shared/components/COMPONENTS.md)
- [Styling Guide](../../shared/styles/STYLING_GUIDE.md)
- [Error Handling Guide](../../shared/utils/ERROR_HANDLING.md)

