# Video Upload Component

Receives and processes uploaded video files from the frontend.

## Purpose
- Receives uploaded video files from `frontend/upload/`
- Extracts frames from uploaded video
- Processes frames for downstream analysis (same as liveVideo after frame extraction)

## Input
- Uploaded video file from frontend

## Output
- Processed video frames (same format as liveVideo output)
- Feeds into the same backend pipeline: poseEstimation → exercise-specific processing

## Relationship to Live Video
- **liveVideo/**: Receives real-time streamed frames
- **videoUpload/**: Receives uploaded video file, extracts frames
- **Both converge**: After frame extraction, both use the same processing pipeline

