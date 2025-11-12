# Reform - Exercise Analyzer App

**Version:** 0.0.0 (v0 Launch)

## Architecture Overview

This architecture represents the v0 launch structure for Reform.

### Layer 0: Root Level Components
- **exercises/**: Exercise instances directory
- **frontend/**: User interface and visualization components
  - **frontend/camera/**: iPhone camera capture and frame streaming to backend

### Layer 1: Exercise Backend
- **exercises/backend/**: Core analysis logic and processing for exercises
  - **exercises/backend/live-video/**: Receives and processes streamed frames from frontend
  - **exercises/backend/pose-estimation/**: Pose estimation component
  - **exercises/backend/llm-form-analysis/**: LLM-based form analysis component
  - **exercises/backend/feedback/**: Feedback generation component

## Common Processes

### Camera Streaming (Common to All Exercises)
When the iPhone camera starts running in the Frontend:
1. Camera frames are captured via `frontend/camera/`
2. Frames are streamed to the Reform Backend
3. Backend receives frames via `exercises/backend/live-video/`
4. This process is shared/common across all exercise instances

---

*Architecture details to be expanded as development progresses.*

