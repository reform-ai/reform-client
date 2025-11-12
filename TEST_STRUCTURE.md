# Test Structure

## Best Practice Recommendation

Tests are organized using `__tests__` directories that mirror the source structure. This approach:
- Keeps tests close to the code they test
- Makes it easy to find and maintain tests
- Supports easy debugging
- Follows common React/JavaScript conventions

## Structure

**Root Level:**
- `src/` - Source code directory
- `tst/` - Test code directory (mirrors `src/` structure)

**Test Organization:**
```
tst/
  backend/
    __tests__/                    # Test utilities and helpers for backend
    shared/
      live-video/__tests__/       # Tests for live-video component
      pose-estimation/__tests__/  # Tests for pose-estimation component
      video-upload/__tests__/      # Tests for video-upload component
    exercise-1/
      calculation/__tests__/      # Tests for calculation component
      llm-form-analysis/__tests__/ # Tests for llm-form-analysis component
      feedback/__tests__/         # Tests for feedback component
    (same pattern for exercise-2 and exercise-3)

  frontend/
    __tests__/                    # Test utilities and helpers for frontend
    camera/__tests__/             # Tests for camera components (livestream & upload)
```

## Principle

Tests are placed at the **component level** (where code files are), not at intermediate directory levels. This keeps tests close to the code they test without unnecessary nesting.

## Test Entry Points

- `Main.js` - Live streaming flow (production)
- `Main_test.js` - Video upload flow (testing)

## Test Files Naming

- Component tests: `ComponentName.test.js` or `ComponentName.spec.js`
- Integration tests: `integration.test.js`
- Test utilities: `testUtils.js` or `testHelpers.js`

