# 🛠️ Reform - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iPhone with Expo Go app

### Setup
```bash
# Clone and install
git clone <your-repo-url>
cd reform-ai-trainer
npm install

# Set up environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Start development
npm run start:go
```

## 🔧 Development Commands

```bash
# Development
npm run start:dev          # Development build
npm run start:go           # Expo Go (recommended)
npm run web                # Web development

# Building
npm run build:android      # Android build
npm run build:ios          # iOS build
npm run build:all          # Both platforms

# Quality
npm test                   # Run tests
npm run lint               # Lint code
npm run lint:fix           # Fix linting issues
npm run type-check         # TypeScript checking

# Maintenance
npm run clean              # Clean and reinstall
npm run clean:cache        # Clear Expo cache
```

## 📝 Code Standards

### ESLint Configuration
- **Expo ESLint config** for React Native
- **TypeScript support** for better IDE experience
- **Consistent formatting** with Prettier

### Code Style
- **Camel case** for variables and functions
- **Pascal case** for components
- **UPPER_CASE** for constants
- **Descriptive names** for clarity

### File Organization
- **One component per file**
- **Co-located styles** with components
- **Index files** for clean imports
- **Consistent folder structure**

## 🧪 Testing

### Test Structure
```
__tests__/
├── components/     # Component tests
├── core/          # Core module tests
├── shared/        # Utility tests
└── integration/   # Integration tests
```

### Writing Tests
```javascript
// Example test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });
  
  it('should handle user interactions', () => {
    // Test implementation
  });
});
```

## 🐛 Debugging

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
npm run start:go
```

### Common Issues
1. **TensorFlow initialization** - Check device compatibility
2. **Camera permissions** - Verify device settings
3. **LLM API errors** - Check API key and credits
4. **Pose detection** - Ensure good lighting and positioning

### Debug Tools
- **React Native Debugger** for state inspection
- **Expo DevTools** for performance monitoring
- **Console logs** for detailed debugging
- **Network inspector** for API calls

## 🔄 Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `hotfix/*` - Critical fixes

### Commit Messages
```
type(scope): description

feat(audio): add text-to-speech feedback
fix(pose): resolve detection accuracy issue
docs(readme): update installation instructions
```

### Pull Request Process
1. **Create feature branch** from develop
2. **Make changes** with tests
3. **Update documentation** if needed
4. **Submit pull request** with description
5. **Code review** and merge

## 📦 Dependencies

### Adding Dependencies
```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name

# Expo managed dependency
npx expo install package-name
```

### Updating Dependencies
```bash
# Check outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (careful!)
npm update
```

## 🚀 Deployment

### Development Build
```bash
# Create development build
npx expo install expo-dev-client
npx expo run:ios
npx expo run:android
```

### Production Build
```bash
# Build for production
npx eas build --platform all
```

### App Store Submission
```bash
# Submit to stores
npx eas submit --platform all
```

## 📊 Performance

### Optimization Tips
- **Lazy load** heavy components
- **Memoize** expensive calculations
- **Optimize images** and assets
- **Use FlatList** for large lists
- **Profile** with React Native Debugger

### Monitoring
- **FPS monitoring** during development
- **Memory usage** tracking
- **API response times**
- **User interaction** analytics

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TensorFlow.js Docs](https://www.tensorflow.org/js)
- [OpenAI API Docs](https://platform.openai.com/docs)
