# Features Directory

This directory contains feature-based code organization. Each feature is self-contained with its own components, pages, and utilities.

## Structure

```
features/
├── expert-coaching/    # Expert Coaching feature
│   ├── components/     # Feature-specific components
│   ├── pages/         # Feature-specific pages
│   ├── utils/         # Feature-specific utilities
│   ├── index.js       # Main export file
│   └── README.md      # Feature documentation
├── workout-plans/      # Workout Plans feature
│   ├── components/     # Feature-specific components
│   ├── pages/         # Feature-specific pages
│   ├── utils/         # Feature-specific utilities
│   ├── index.js       # Main export file
│   └── README.md      # Feature documentation
├── analysis/          # Analysis feature
│   ├── components/     # Feature-specific components (analysis + charts)
│   ├── pages/         # Feature-specific pages
│   ├── utils/         # Feature-specific utilities
│   ├── index.js       # Main export file
│   └── README.md      # Feature documentation
└── README.md          # This file
```

## Philosophy

### Feature-Based vs Type-Based Organization

**Type-based organization** (in `src/shared/` and `src/pages/`):
- Groups code by type: all components together, all pages together
- Good for: Shared/generic code used across features
- Example: `shared/components/layout/PageContainer` (used by all features)

**Feature-based organization** (in `src/features/`):
- Groups code by feature: all expert-coaching code together
- Good for: Feature-specific code that's self-contained
- Example: `features/expert-coaching/` (all expert-coaching code)

### When to Use Each

**Use Feature-Based (`features/`):**
- ✅ Feature-specific components (not reused elsewhere)
- ✅ Feature-specific pages
- ✅ Feature-specific utilities
- ✅ Feature-specific hooks
- ✅ Self-contained features

**Use Type-Based (`shared/` or root):**
- ✅ Shared/generic components (used by multiple features)
- ✅ Shared utilities (used across features)
- ✅ Layout components
- ✅ Common hooks
- ✅ API configuration (centralized)

## Current Features

### Expert Coaching

All expert-coaching related code is organized in `features/expert-coaching/`.

**See:** [Expert Coaching README](./expert-coaching/README.md)

### Workout Plans

All workout-plans related code is organized in `features/workout-plans/`.

**See:** [Workout Plans README](./workout-plans/README.md)

### Analysis

All analysis related code is organized in `features/analysis/`.

**See:** [Analysis README](./analysis/README.md)

## Adding a New Feature

1. **Create feature directory:**
   ```
   src/features/my-feature/
   ├── components/
   ├── pages/
   ├── utils/
   ├── index.js
   └── README.md
   ```

2. **Move feature-specific code:**
   - Move feature components from `shared/components/`
   - Move feature pages from `pages/`
   - Move feature utilities from `shared/utils/`

3. **Update imports:**
   - Update all imports to use new paths
   - Update routing in `App.jsx`
   - Update any cross-feature imports

4. **Create index.js:**
   - Export commonly used components/utilities
   - Makes imports cleaner: `import { Component } from '../features/my-feature'`

5. **Document:**
   - Create README.md explaining the feature
   - Document dependencies and usage

## Benefits

- **Better cohesion** - Related code grouped together
- **Easier feature development** - All code in one place
- **Better for collaboration** - Clear feature boundaries
- **Easier to understand** - See feature scope at a glance
- **Scalable** - Add features without cluttering shared directories

## Migration Strategy

Features are migrated gradually:
1. Start with one feature as a pilot (expert-coaching)
2. Move feature-specific code to feature directory
3. Update imports and routing
4. Keep old files temporarily for reference (can be removed later)
5. Document the pattern for future features

## Related Documentation

- [Component Catalog](../shared/components/COMPONENTS.md)
- [Styling Guide](../shared/styles/STYLING_GUIDE.md)
- [Error Handling Guide](../shared/utils/ERROR_HANDLING.md)

