# Reform - Exercise Analyzer App

**Version:** 0.1.0 (v0 Launch)

## Architecture Overview

This architecture represents the v0 launch structure for Reform.

### Directory Structure

**Root Level:**
- `App.jsx` - Live streaming flow (production)
- `App.test.js` - Video upload flow (testing)
- `src/` - Source code directory
- `tst/` - Test code directory

### Layer 0: Source Components (`src/`)
- **src/frontend/**: User interface and visualization components
  - **src/frontend/camera/**: Camera-related features
    - **liveVideo/**: Live streaming feature
    - **uploadVideo/**: Video upload feature
- **src/backend/**: Core analysis logic and processing for exercises
  - **src/backend/shared/**: Shared components across all exercises
    - **liveVideo/**: Receives and processes streamed frames from frontend
    - **poseEstimation/**: Pose estimation component (shared across all exercises)
    - **uploadVideo/**: Receives and processes uploaded video files
  - **src/backend/exercise-1/**: Exercise 1 specific components
    - **calculation/**: Uses pose estimation data points to determine form correctness
    - **llmFormAnalysis/**: LLM-based form analysis specific to Exercise 1
    - **feedback/**: Feedback generation specific to Exercise 1
  - **src/backend/exercise-2/**: Exercise 2 specific components
    - **calculation/**: Uses pose estimation data points to determine form correctness
    - **llmFormAnalysis/**: LLM-based form analysis specific to Exercise 2
    - **feedback/**: Feedback generation specific to Exercise 2
  - **src/backend/exercise-3/**: Exercise 3 specific components
    - **calculation/**: Uses pose estimation data points to determine form correctness
    - **llmFormAnalysis/**: LLM-based form analysis specific to Exercise 3
    - **feedback/**: Feedback generation specific to Exercise 3

### Test Structure (`tst/`)
- **tst/**: Test directory mirroring `src/` structure
- Tests are organized in `__tests__/` directories at the component level
- All test files must use the `.test.js` suffix (e.g., `ComponentName.test.js`)
- Tests are placed at the component level (where code files are), not at intermediate directory levels

## Two Separate Features

### Feature 1: Live Streaming (App.jsx)
- **Input**: Real-time camera frames
- **Frontend**: `src/frontend/camera/liveVideo/` - captures and streams frames
- **Backend Entry**: `src/backend/shared/liveVideo/` - receives streamed frames
- **Processing**: Same backend pipeline (pose estimation → calculation → LLM → feedback)

### Feature 2: Video Upload (App.test.js)
- **Input**: Uploaded video file
- **Frontend**: `src/frontend/camera/uploadVideo/` - handles video file upload
- **Backend Entry**: `src/backend/shared/uploadVideo/` - receives uploaded video
- **Processing**: Same backend pipeline (pose estimation → calculation → LLM → feedback)

**Shared Backend Pipeline**: Both features converge at the shared backend components (poseEstimation, exercise-specific processing, feedback).

## Coding Constraints

### Technology Stack
1. **Main Components**: React with JavaScript (JSX)
2. **Machine Learning**: Python (for ML-specific components)
3. **File Extensions**: 
   - React components: `.jsx`
   - JavaScript utilities: `.js`

### Function Constraints
1. **Function Length**: Each function should be written under **20 lines**
2. **External Libraries**: No external libraries unless explicitly instructed otherwise
3. **File Organization**: Functions should be split up into different files whenever possible

### Test File Naming
1. **Test Files**: All test files must use the `.test.js` suffix (e.g., `ComponentName.test.js`)
2. **Test Location**: Test files are located in `tst/` directory, mirroring the `src/` structure
3. **Test Organization**: Tests are placed in `__tests__/` directories at the component level

## Common Processes

### Camera Streaming (Common to All Exercises)
When the iPhone camera starts running in the Frontend:
1. Camera frames are captured via `frontend/camera/`
2. Frames are streamed to the Reform Backend
3. Backend receives frames via `src/backend/shared/liveVideo/`
4. This process is shared/common across all exercise instances

---

*Architecture details to be expanded as development progresses.*
