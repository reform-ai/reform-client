# Feature Architecture

## Two Separate Features

### Feature 1: Live Streaming (Main.js)
- **Input**: Real-time camera frames
- **Frontend**: `src/frontend/camera/livestream/` - captures and streams frames
- **Backend Entry**: `src/backend/shared/live-video/` - receives streamed frames
- **Processing**: Same backend pipeline (pose estimation → calculation → LLM → feedback)

### Feature 2: Video Upload (Main_test.js)
- **Input**: Uploaded video file
- **Frontend**: `src/frontend/camera/upload/` - handles video file upload
- **Backend Entry**: `src/backend/shared/video-upload/` - receives uploaded video
- **Processing**: Same backend pipeline (pose estimation → calculation → LLM → feedback)

## Shared Backend Pipeline

Both features converge at the shared backend components:
1. **Pose Estimation** (`src/backend/shared/pose-estimation/`) - Same for both
2. **Exercise-specific processing** (`src/backend/exercise-X/`) - Same for both
3. **Feedback** - Same output format

## Architecture Benefits

✅ **Separation of Concerns**: Each feature has its own frontend component
✅ **Shared Backend**: Processing logic is reused, reducing duplication
✅ **Easy to Maintain**: Changes to one feature don't affect the other
✅ **Easy to Test**: Can test upload feature independently of live streaming
✅ **Easy to Merge**: Both use the same backend interface after input stage

## Implementation Strategy

1. **Frontend Layer**: Separate components (`src/frontend/camera/livestream/` vs `src/frontend/camera/upload/`)
2. **Backend Entry Layer**: Separate entry points (`src/backend/shared/live-video/` vs `src/backend/shared/video-upload/`)
3. **Processing Layer**: Shared components (pose-estimation, exercise-specific logic)
4. **Output Layer**: Shared feedback format

The key is that after the input stage (frames from camera vs frames from video), everything else is identical.

