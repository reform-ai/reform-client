# Basketball Form Analyzer - Clean Architecture

This is the reorganized codebase for the Basketball Form Analyzer app, following clean architecture principles.

## 📁 Folder Structure

```
src/
├── frontend/                 # React Native UI components
│   ├── components/          # Reusable UI components
│   │   └── PoseOverlay.js   # Pose detection overlay component
│   ├── screens/             # Screen components
│   ├── styles/              # Styling and themes
│   │   └── appStyles.js     # Main app styles
│   ├── utils/               # Frontend utilities
│   └── App.js               # Main app component
├── backend/                 # Backend services (if needed)
│   ├── services/            # Business logic services
│   ├── controllers/         # API controllers
│   └── middleware/          # Express middleware
├── database/                # Database related files
│   ├── models/              # Data models
│   ├── migrations/          # Database migrations
│   └── seeds/               # Database seeds
├── core/                    # Core functionality modules
│   ├── video/               # Video processing and camera
│   │   └── videoInput.js    # Video input and movement detection
│   ├── audio/               # Audio processing
│   │   └── audioOutput.js   # Audio feedback system
│   ├── pose/                # Pose detection and analysis
│   │   └── basketballFormAnalyzer.js  # Basketball-specific analysis
│   └── llm/                 # LLM integration
│       ├── config.js        # LLM configuration
│       ├── llmArchitecture.js  # LLM architecture
│       ├── openaiClient.js  # OpenAI client
│       └── openaiService.js # OpenAI service
├── shared/                  # Shared utilities and constants
│   ├── errors/              # Error handling
│   │   └── ErrorHandler.js  # Centralized error handling
│   ├── validation/          # Input validation
│   │   └── InputValidator.js # Input validation utilities
│   ├── constants/           # Application constants
│   │   └── AppConstants.js  # All app constants
│   └── types/               # Type definitions
│       └── TypeDefinitions.js # TypeScript-like type definitions
└── config/                  # Configuration files
    └── AppConfig.js         # Main app configuration
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Frontend**: UI components, screens, and user interactions
- **Core**: Business logic and core functionality
- **Shared**: Reusable utilities, constants, and types
- **Config**: Configuration management

### 2. **Dependency Direction**
- Frontend depends on Core modules
- Core modules depend on Shared utilities
- No circular dependencies
- Clear interfaces between layers

### 3. **Error Handling**
- Centralized error handling in `shared/errors/`
- Custom error types for different modules
- Consistent error responses
- Proper error logging

### 4. **Input Validation**
- Centralized validation in `shared/validation/`
- Type-safe validation functions
- Consistent validation rules
- Clear error messages

### 5. **Configuration Management**
- Environment-based configuration
- Module-specific configs
- Validation of configuration values
- Runtime configuration updates

## 🔧 Key Features

### **Core Modules**
- **Video Processing**: Camera integration, movement detection, pose estimation
- **Audio System**: Text-to-speech feedback, audio configuration
- **Pose Analysis**: Basketball-specific form analysis, technique scoring
- **LLM Integration**: AI-powered feedback generation

### **Shared Utilities**
- **Error Handling**: Comprehensive error management
- **Validation**: Input validation and sanitization
- **Constants**: Centralized configuration values
- **Types**: Type definitions for better code clarity

### **Frontend**
- **Components**: Reusable UI components
- **Screens**: Main app screens and layouts
- **Styles**: Consistent styling system
- **Utils**: Frontend-specific utilities

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Set up your OpenAI API key
   - Configure other environment variables

3. **Run the App**
   ```bash
   npx expo start
   ```

## 📝 Development Guidelines

### **Adding New Features**
1. Identify the appropriate module (core, frontend, shared)
2. Create the necessary files in the correct folder
3. Add proper error handling and validation
4. Update imports and exports
5. Test thoroughly

### **Error Handling**
- Use the centralized error handling system
- Create specific error types for new modules
- Always validate inputs before processing
- Log errors appropriately

### **Code Organization**
- Keep related functionality together
- Use clear, descriptive names
- Follow the established folder structure
- Document complex logic

## 🔍 Module Dependencies

```
Frontend (App.js)
    ↓
Core Modules (video, audio, pose, llm)
    ↓
Shared Utilities (errors, validation, constants, types)
    ↓
Configuration (AppConfig.js)
```

This structure ensures maintainability, testability, and scalability while keeping the codebase organized and easy to navigate.
