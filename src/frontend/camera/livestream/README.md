# Live Stream Component

Handles real-time camera streaming for the live streaming feature (Main.js flow).

## Purpose
- Captures frames from iPhone camera in real-time
- Streams frames to backend for analysis
- Handles live camera feed processing

## Flow
1. User selects exercise type
2. Camera starts capturing frames
3. Frames are streamed to backend in real-time
4. Receives feedback from backend and displays to user

## Relationship to Upload
- **Live Stream** (`frontend/camera/livestream/`): Real-time frame capture and streaming
- **Upload** (`frontend/camera/upload/`): File-based upload and processing
- Both are camera-related features but use different input methods

