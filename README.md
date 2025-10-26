# 🏀 Basketball Form Analyzer

AI-powered basketball shooting form analysis with real-time pose detection and coaching feedback.

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

## ✨ Features

- 🎯 **Real-time Pose Detection** - TensorFlow.js + MoveNet
- 🤖 **AI-Powered Coaching** - OpenAI GPT-4 integration  
- 🔊 **Audio Feedback** - Text-to-speech coaching tips
- 👁️ **Visual Overlay** - Real-time skeleton visualization
- 🏀 **Basketball-Specific** - Focused on shooting technique

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Start the app
npm run start:go

# Scan QR code with your iPhone
```

## 📚 Documentation

For complete documentation, setup guides, and troubleshooting:

👉 **[📖 Full Documentation](./docs/README.md)**

## 🏗️ Architecture

```
src/
├── frontend/     # React Native UI
├── core/         # Core functionality  
├── shared/       # Shared utilities
└── config/       # Configuration
```

## 🛠️ Development

```bash
# Development
npm run start:dev

# Testing
npm test

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📱 Platform Support

- **iOS 13+** with Expo Go
- **Android 8+** with Expo Go
- **Camera & Microphone** permissions required

## 🎯 Performance

- **90% reduction** in API calls
- **60% reduction** in camera overhead
- **Smart caching** and throttling
- **Adaptive feedback** intervals

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

**Ready to improve your basketball form? Let's go! 🏀✨**