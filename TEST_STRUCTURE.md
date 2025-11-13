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
      liveVideo/__tests__/       # Tests for liveVideo component
      poseEstimation/__tests__/  # Tests for poseEstimation component
      videoUpload/__tests__/      # Tests for videoUpload component
    exercise-1/
      calculation/__tests__/      # Tests for calculation component
      llmFormAnalysis/__tests__/ # Tests for llmFormAnalysis component
      feedback/__tests__/         # Tests for feedback component
    (same pattern for exercise-2 and exercise-3)

  frontend/
    __tests__/                    # Test utilities and helpers for frontend
    camera/__tests__/             # Tests for camera components (liveStream & upload)
```

## Principle

Tests are placed at the **component level** (where code files are), not at intermediate directory levels. This keeps tests close to the code they test without unnecessary nesting.

## Test Entry Points

- `App.js` - Live streaming flow (production)
- `App.test.js` - Video upload flow (testing)

## Test Files Naming Convention

**All test files must use the `.test.js` suffix:**
- Component tests: `ComponentName.test.js`
- Integration tests: `integration.test.js`
- Test utilities: `testUtils.js` or `testHelpers.js` (non-test files, helpers only)

**Examples:**
- `src/backend/shared/liveVideo/VideoProcessor.js` → `tst/backend/shared/liveVideo/__tests__/VideoProcessor.test.js`
- `src/frontend/camera/liveStream/CameraCapture.js` → `tst/frontend/camera/__tests__/CameraCapture.test.js`
- `src/backend/exercise-1/calculation/FormAnalyzer.js` → `tst/backend/exercise-1/calculation/__tests__/FormAnalyzer.test.js`

**Note:** The `.spec.js` naming is not used. All tests must follow the `.test.js` convention.

