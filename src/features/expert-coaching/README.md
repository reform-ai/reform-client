# Expert Coaching Feature

This directory contains all code related to the Expert Coaching feature, organized in a feature-based structure.

## Structure

```
expert-coaching/
├── components/          # Feature-specific React components
├── pages/              # Feature-specific page components
├── utils/              # Feature-specific utilities
├── index.js            # Main export file
└── README.md           # This file
```

## Components

All expert-coaching specific components:
- `ConsultationStatusBadge` - Status badge component
- `ConsultationTimestamps` - Timestamp display component
- `ConsultationScheduledTime` - Scheduled time display component
- `PTBookingInfo` - PT booking information component
- `AcknowledgmentComponent` - Acknowledgment component
- `PARQComponent` - PAR-Q questionnaire component

## Pages

All expert-coaching page components:
- `ExpertCoachingPage` - Main landing page
- `ExpertCoachingRequestPage` - Request consultation page
- `ExpertCoachingVoucherPage` - Voucher validation page
- `ExpertCoachingBookingPage` - Booking page
- `ExpertCoachingConsultationsPage` - User consultations list
- `ExpertCoachingDetailPage` - User consultation detail
- `PTExpertCoachingConsultationsPage` - PT consultations list
- `PTExpertCoachingDetailPage` - PT consultation detail

## Utilities

Feature-specific utilities:
- `expertCoachingConstants.js` - Status colors and labels
- `expertCoachingDateFormat.js` - Date formatting for expert coaching

## Usage

### Importing Components

```jsx
// Import from feature index
import { ConsultationStatusBadge } from '../features/expert-coaching';

// Or import directly
import ConsultationStatusBadge from '../features/expert-coaching/components/ConsultationStatusBadge';
```

### Importing Utilities

```jsx
// Import from feature index
import { formatScheduledStartTime, getStatusColor } from '../features/expert-coaching';

// Or import directly
import { formatScheduledStartTime } from '../features/expert-coaching/utils/expertCoachingDateFormat';
```

### Importing Pages

```jsx
// Import directly (pages are typically used in routing)
import ExpertCoachingPage from '../features/expert-coaching/pages/ExpertCoachingPage';
```

## Dependencies

This feature depends on:
- `shared/utils/authenticatedFetch` - API request utilities
- `shared/utils/dateFormat` - Base date formatting utilities
- `shared/styles/` - Styling constants and utilities
- `shared/components/layout/` - Layout components
- `config/api/expertCoaching.js` - API endpoints

## Adding New Code

When adding new expert-coaching functionality:

1. **Components** → Add to `components/`
2. **Pages** → Add to `pages/`
3. **Utilities** → Add to `utils/`
4. **Update exports** → Add to `index.js` if needed

## Related Documentation

- [Component Catalog](../../shared/components/COMPONENTS.md)
- [Error Handling Guide](../../shared/utils/ERROR_HANDLING.md)
- [Styling Guide](../../shared/styles/STYLING_GUIDE.md)

