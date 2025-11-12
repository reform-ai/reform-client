# Video Upload Component

Receives and processes uploaded video files from the frontend.

## Purpose
- Receives uploaded video files from `frontend/upload/`
- Extracts frames from uploaded video
- Processes frames for downstream analysis (same as live-video after frame extraction)

## Input
- Uploaded video file from frontend

## Output
- Processed video frames (same format as live-video output)
- Feeds into the same backend pipeline: pose-estimation → exercise-specific processing

## Relationship to Live Video
- **live-video/**: Receives real-time streamed frames
- **video-upload/**: Receives uploaded video file, extracts frames
- **Both converge**: After frame extraction, both use the same processing pipeline

