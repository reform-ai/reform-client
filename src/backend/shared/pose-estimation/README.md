# Pose Estimation Component

Identifies and tracks body part locations from video frames.

## Purpose
- Detects body keypoints/landmarks in video frames
- Provides pose data (body part coordinates) to exercise-specific components
- Shared across all exercises - the pose detection logic is the same regardless of exercise type

## Input
- Video frames (from live-video component)

## Output
- Pose data points (body part locations/coordinates)

