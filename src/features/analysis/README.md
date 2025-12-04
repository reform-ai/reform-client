# Analysis Feature

This directory contains all code related to the Analysis feature, organized in a feature-based structure.

## Structure

```
analysis/
├── components/          # Feature-specific React components
│   ├── Analysis components (8 files)
│   └── Chart components (4 files)
├── pages/              # Feature-specific page components
├── utils/              # Feature-specific utilities (currently empty)
├── index.js            # Main export file
└── README.md           # This file
```

## Components

### Analysis Components
- `AnalysisFilterBar` - Filter bar for analysis history
- `AnalysisSectionHeader` - Header component for analysis sections
- `AnalysisUploader` - Component for uploading videos for analysis
- `AngleAnalysis` - Angle analysis display component
- `AsymmetryAnalysis` - Asymmetry analysis display component
- `KneeValgusAnalysis` - Knee valgus (FPPA) analysis component
- `MovementAnalysis` - Movement analysis display component
- `RepConsistencyAnalysis` - Rep consistency analysis component

### Chart Components
- `AnglePlot` - Chart component for displaying angle data
- `AsymmetryPlot` - Chart component for displaying asymmetry data
- `FPPAPlot` - Chart component for displaying FPPA (Frontal Plane Projection Angle) data
- `PerRepPlot` - Chart component for displaying per-rep data

## Pages

All analysis page components:
- `AnalysisHistoryPage` - Analysis history list page
- `AnalysisDetailPage` - Individual analysis detail page

## Usage

### Importing Components

```jsx
// Import from feature index
import { AngleAnalysis, AnglePlot } from '../features/analysis';

// Or import directly
import AngleAnalysis from '../features/analysis/components/AngleAnalysis';
```

### Importing Pages

```jsx
// Import directly (pages are typically used in routing)
import AnalysisHistoryPage from '../features/analysis/pages/AnalysisHistoryPage';
```

## Dependencies

This feature depends on:
- `shared/utils/authenticatedFetch` - API request utilities
- `shared/utils/analysisApi` - Analysis API utilities
- `shared/utils/analysisDataNormalizer` - Analysis data normalization
- `shared/utils/dateFormat` - Date formatting utilities
- `shared/utils/scoreUtils` - Score calculation utilities
- `shared/components/layout/` - Layout components
- `shared/components/modals/` - Modal components
- `shared/components/ScoreBreakdown` - Score breakdown component
- `config/api/analysis.js` - API endpoints

## Related Documentation

- [Component Catalog](../../shared/components/COMPONENTS.md)
- [Styling Guide](../../shared/styles/STYLING_GUIDE.md)
- [Error Handling Guide](../../shared/utils/ERROR_HANDLING.md)

