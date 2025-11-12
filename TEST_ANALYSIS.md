# Test Directory Analysis

## Current Structure

We have test directories at multiple levels. Let's analyze what's necessary:

### Redundant Test Directories (Intermediate Levels)

These are at intermediate directory levels and are **NOT necessary**:
- `backend/shared/__tests__` - Redundant (we have component-level tests below)
- `backend/exercise-1/__tests__` - Redundant (we have component-level tests below)
- `backend/exercise-2/__tests__` - Redundant (we have component-level tests below)
- `backend/exercise-3/__tests__` - Redundant (we have component-level tests below)

### Necessary Test Directories

**Component-Level Tests** (where actual code files will be):
- `backend/shared/live-video/__tests__` ✅ Keep
- `backend/shared/pose-estimation/__tests__` ✅ Keep
- `backend/shared/video-upload/__tests__` ✅ Should add (missing)
- `backend/exercise-1/calculation/__tests__` ✅ Keep
- `backend/exercise-1/llm-form-analysis/__tests__` ✅ Keep
- `backend/exercise-1/feedback/__tests__` ✅ Keep
- (Same for exercise-2 and exercise-3)
- `frontend/camera/__tests__` ✅ Keep (or split into livestream/__tests__ and upload/__tests__)

**Shared Test Utilities** (for reusable test helpers):
- `backend/__tests__` ✅ Keep (for backend test utilities)
- `frontend/__tests__` ✅ Keep (for frontend test utilities)

## Recommendation

**Remove intermediate-level test directories** - they're redundant and add unnecessary nesting. Tests should be:
1. At the component level (where code files are)
2. In shared utility directories (for test helpers)

This follows the principle: "Tests should be as close as possible to the code they test, but not create unnecessary directory nesting."

