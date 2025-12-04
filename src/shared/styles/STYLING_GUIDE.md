# Styling Guide for Reform Client

## Overview

This project uses a **hybrid approach** combining CSS variables, style constants, and inline styles. This guide explains when to use each approach.

## Styling Approaches

### 1. CSS Variables (Global Styles)
**Location:** `src/index.css`

CSS variables are defined in `:root` and should be used for:
- Global theme colors (backgrounds, text colors, borders)
- Values that need to be consistent across the entire app
- Values that might change with theme switching (future feature)

**Usage:**
```jsx
// ✅ Good - Uses CSS variable
<div style={{ backgroundColor: 'var(--bg-primary)' }}>

// ❌ Bad - Hardcoded color
<div style={{ backgroundColor: 'rgb(10, 14, 26)' }}>
```

### 2. Style Constants (JavaScript)
**Location:** `src/shared/styles/constants.js`

Use style constants for:
- Frequently reused values (spacing, typography, colors)
- Values that need to be computed or combined
- Inline styles that reference the same values multiple times

**Usage:**
```jsx
import { COLORS, SPACING, TYPOGRAPHY } from '../shared/styles/constants';

<div style={{ 
  padding: SPACING.lg, 
  color: COLORS.text.primary,
  fontSize: TYPOGRAPHY.fontSize.base 
}}>
```

### 3. Style Utilities (Helper Functions)
**Location:** `src/shared/styles/utils.js`

Use utility functions for:
- Common patterns (cards, buttons, containers)
- Complex style objects that are reused
- Styles that depend on props/state

**Usage:**
```jsx
import { createCardStyle, createButtonStyle } from '../shared/styles/utils';

<div style={createCardStyle({ padding: '20px' })}>
<button style={createButtonStyle('primary', { disabled: true })}>
```

### 4. CSS Files (Component-Specific)
**Location:** `src/shared/styles/` or component directories

Use CSS files for:
- Complex component-specific styles
- Animations and transitions
- Styles that benefit from CSS features (pseudo-selectors, media queries)
- Styles shared across multiple related components

**Usage:**
```jsx
import './ComponentName.css';

<div className="component-container">
```

### 5. Inline Styles (Simple, One-off)
**Use inline styles for:**
- Simple, one-off styles that don't need reuse
- Dynamic styles based on props/state
- Quick prototyping (but consider migrating to constants later)

**Guidelines:**
- ✅ Use CSS variables or constants for colors, spacing, typography
- ✅ Keep inline styles simple and readable
- ❌ Don't hardcode colors, spacing, or typography values
- ❌ Don't duplicate complex style objects

## Migration Strategy

### For New Components
1. Use style constants from `constants.js`
2. Use utility functions from `utils.js` when applicable
3. Use CSS variables for theme values
4. Only use inline styles for simple, dynamic values

### For Existing Components
1. **Don't break working code** - existing inline styles are fine
2. When modifying a component, gradually migrate to constants
3. Extract repeated style objects to utilities
4. Replace hardcoded values with constants

## Examples

### ✅ Good - Using Constants
```jsx
import { COLORS, SPACING, createCardStyle } from '../shared/styles/constants';
import { createCardStyle } from '../shared/styles/utils';

<div style={createCardStyle({ marginBottom: SPACING['2xl'] })}>
  <h3 style={{ fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.text.primary }}>
    Title
  </h3>
</div>
```

### ✅ Good - Using CSS Variables
```jsx
<div style={{ 
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)'
}}>
```

### ⚠️ Acceptable - Simple Inline Styles
```jsx
<div style={{ 
  display: 'flex', 
  gap: '12px',
  alignItems: 'center'
}}>
```

### ❌ Bad - Hardcoded Values
```jsx
<div style={{ 
  padding: '16px',           // Should use SPACING.lg
  color: '#10b981',          // Should use COLORS.status.scheduled
  fontSize: '18px'           // Should use TYPOGRAPHY.fontSize.lg
}}>
```

## Color Usage

### Status Colors
Use `COLORS.status.*` for consultation/workout statuses:
- `COLORS.status.pending`
- `COLORS.status.scheduled`
- `COLORS.status.completed`
- etc.

### Theme Colors
Use CSS variables for theme colors:
- `var(--bg-primary)`
- `var(--text-primary)`
- `var(--border-color)`

### Expert Coaching Specific
Use `COLORS.expertCoaching.*` for expert-coaching specific colors:
- `COLORS.expertCoaching.pendingBg`
- `COLORS.expertCoaching.confirmedText`
- etc.

## Spacing

Always use `SPACING` constants:
- `SPACING.xs` (4px)
- `SPACING.sm` (8px)
- `SPACING.md` (12px)
- `SPACING.lg` (16px)
- `SPACING.xl` (20px)
- `SPACING['2xl']` (24px)

## Typography

Use `TYPOGRAPHY` constants:
- `TYPOGRAPHY.fontSize.sm` (14px)
- `TYPOGRAPHY.fontSize.base` (16px)
- `TYPOGRAPHY.fontSize.lg` (18px)
- `TYPOGRAPHY.fontWeight.semibold` (600)

## Best Practices

1. **Consistency**: Use the same spacing/color values throughout
2. **Maintainability**: Centralize values in constants
3. **Readability**: Prefer named constants over magic numbers
4. **Flexibility**: Use CSS variables for theme values
5. **Performance**: Inline styles are fine for React (no performance penalty)

## Questions?

When in doubt:
1. Check if a constant exists in `constants.js`
2. Check if a utility function exists in `utils.js`
3. Use CSS variables for theme values
4. Keep it simple - don't over-engineer

