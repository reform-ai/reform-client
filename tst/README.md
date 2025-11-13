# Test Directory

This directory contains all test code, organized to mirror the `src/` structure.

## Structure

Tests are organized in `__tests__/` directories that mirror the source code structure:
- `tst/backend/` - Tests for backend components
- `tst/frontend/` - Tests for frontend components

Each component in `src/` has a corresponding test directory in `tst/` with the same path structure.

## Test File Naming

**All test files must use the `.test.js` suffix:**
- Source file: `src/backend/shared/liveVideo/VideoProcessor.js`
- Test file: `tst/backend/shared/liveVideo/__tests__/VideoProcessor.test.js`

This convention ensures consistency and makes test files easily identifiable.

See `TEST_STRUCTURE.md` for detailed test organization documentation.

