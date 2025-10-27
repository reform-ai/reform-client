# 🏗️ Reform - Architecture Guide

## Overview

Reform follows clean architecture principles with clear separation of concerns and dependency direction.

## 📁 Project Structure

```
src/
├── frontend/          # React Native UI Layer
│   ├── components/    # Reusable UI components
│   ├── screens/       # Screen components
│   ├── styles/        # Styling and themes
│   ├── utils/         # Frontend utilities
│   └── App.js         # Main app component
├── core/              # Core Business Logic
│   ├── video/         # Camera & movement detection
│   ├── audio/         # Text-to-speech feedback
│   ├── pose/          # Pose analysis & form detection
│   └── llm/           # AI integration & coaching
├── shared/            # Shared Utilities
│   ├── errors/        # Error handling
│   ├── validation/    # Input validation
│   ├── constants/     # App constants
│   └── types/         # Type definitions
└── config/            # Configuration Management
    └── AppConfig.js   # Main app configuration
```

## 🔄 Dependency Flow

```
Frontend (App.js)
    ↓
Core Modules (video, audio, pose, llm)
    ↓
Shared Utilities (errors, validation, constants, types)
    ↓
Configuration (AppConfig.js)
```

## 🧩 Core Modules

### Video Processing (`core/video/`)
- **Purpose**: Camera integration and movement detection
- **Key Files**: `videoInput.js`
- **Dependencies**: TensorFlow.js, Expo Camera

### Audio System (`core/audio/`)
- **Purpose**: Text-to-speech feedback delivery
- **Key Files**: `audioOutput.js`
- **Dependencies**: Expo Speech

### Pose Analysis (`core/pose/`)
- **Purpose**: Multi-workout form analysis and technique scoring
- **Key Files**: `basketballFormAnalyzer.js`
- **Dependencies**: TensorFlow.js, MoveNet

### LLM Integration (`core/llm/`)
- **Purpose**: AI-powered personalized coaching
- **Key Files**: `openaiClient.js`, `openaiService.js`, `llmArchitecture.js`
- **Dependencies**: OpenAI API

## 🛡️ Error Handling

Centralized error management in `shared/errors/ErrorHandler.js`:
- Custom error types for different modules
- Consistent error responses
- Proper error logging
- Graceful degradation

## ✅ Input Validation

Centralized validation in `shared/validation/InputValidator.js`:
- Type-safe validation functions
- Consistent validation rules
- Clear error messages
- Runtime validation

## ⚙️ Configuration

Environment-based configuration in `config/AppConfig.js`:
- Module-specific configs
- Validation of configuration values
- Runtime configuration updates
- Development vs production settings

## 🔧 Adding New Features

1. **Identify the appropriate module** (frontend, core, shared)
2. **Create files in the correct folder**
3. **Add proper error handling and validation**
4. **Update imports and exports**
5. **Test thoroughly**

## 📊 Performance Considerations

- **Lazy loading** of heavy modules
- **Caching** of LLM responses
- **Throttling** of camera processing
- **Memory management** for pose detection
- **Background processing** for AI analysis
