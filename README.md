# Reform - Exercise Analyzer App

**Version:** 0.0.0 (v0 Launch)

## Architecture Overview

This architecture represents the v0 launch structure for Reform.

### Directory Structure

**Root Level:**
- `Main.js` - Live streaming flow (production)
- `Main_test.js` - Video upload flow (testing)
- `src/` - Source code directory
- `tst/` - Test code directory

### Layer 0: Source Components (`src/`)
- **src/frontend/**: User interface and visualization components
  - **src/frontend/camera/**: Camera-related features
    - **livestream/**: Live streaming feature
    - **upload/**: Video upload feature
- **src/backend/**: Core analysis logic and processing for exercises
  - **src/backend/shared/**: Shared components across all exercises
    - **live-video/**: Receives and processes streamed frames from frontend
    - **pose-estimation/**: Pose estimation component (shared across all exercises)
    - **video-upload/**: Receives and processes uploaded video files
  - **src/backend/exercise-1/**: Exercise 1 specific components
    - **calculation/**: Uses pose estimation data points to determine form correctness
    - **llm-form-analysis/**: LLM-based form analysis specific to Exercise 1
    - **feedback/**: Feedback generation specific to Exercise 1
  - **src/backend/exercise-2/**: Exercise 2 specific components
    - **calculation/**: Uses pose estimation data points to determine form correctness
    - **llm-form-analysis/**: LLM-based form analysis specific to Exercise 2
    - **feedback/**: Feedback generation specific to Exercise 2
  - **src/backend/exercise-3/**: Exercise 3 specific components
    - **calculation/**: Uses pose estimation data points to determine form correctness
    - **llm-form-analysis/**: LLM-based form analysis specific to Exercise 3
    - **feedback/**: Feedback generation specific to Exercise 3

### Test Structure (`tst/`)
- **tst/**: Test directory mirroring `src/` structure
  - Tests are organized in `__tests__/` directories matching the source structure
  - See `TEST_STRUCTURE.md` for details

## Common Processes

### Camera Streaming (Common to All Exercises)
When the iPhone camera starts running in the Frontend:
1. Camera frames are captured via `frontend/camera/`
2. Frames are streamed to the Reform Backend
3. Backend receives frames via `src/backend/shared/live-video/`
4. This process is shared/common across all exercise instances

---

*Architecture details to be expanded as development progresses.*

