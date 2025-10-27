# 🤝 Contributing to Reform

Thank you for your interest in contributing to Reform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Process](#-development-process)
- [Pull Request Process](#-pull-request-process)
- [Code Style](#-code-style)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Reporting Issues](#-reporting-issues)

## 📜 Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you agree to uphold this code.

### Our Pledge
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Git

### Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Reform.git
cd Reform

# Add upstream remote
git remote add upstream https://github.com/NarayanGaryStartupJourney/Reform.git
```

### Setup Development Environment
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set up your OpenAI API key in .env
# Start development server
npm run start:go
```

## 🔄 Development Process

### 1. Create a Branch
```bash
# Create feature branch from develop
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b hotfix/your-bug-fix
```

### 2. Make Changes
- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run tests
npm test

# Lint your code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### 4. Commit Changes
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat(audio): add volume control to audio feedback"
```

### Commit Message Format
```
type(scope): description

feat(audio): add volume control
fix(pose): resolve detection accuracy
docs(readme): update installation guide
test(components): add unit tests for PoseOverlay
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🔀 Pull Request Process

### Before Submitting
- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No merge conflicts

### Creating a Pull Request
1. **Push your branch** to your fork
2. **Create a Pull Request** on GitHub
3. **Fill out the PR template** completely
4. **Request review** from maintainers
5. **Address feedback** promptly

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Screenshots/videos attached (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 🎨 Code Style

### JavaScript/React Native
- **ESLint** configuration enforced
- **Prettier** for code formatting
- **Camel case** for variables and functions
- **Pascal case** for components
- **Descriptive names** for clarity

### File Organization
```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── core/          # Business logic
├── shared/        # Shared utilities
└── config/        # Configuration
```

### Component Structure
```javascript
// Imports
import React from 'react';
import { View, Text } from 'react-native';

// Component
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handlePress = () => {
    // Implementation
  };
  
  // Render
  return (
    <View>
      <Text>{prop1}</Text>
    </View>
  );
};

// PropTypes or TypeScript
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

// Export
export default MyComponent;
```

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
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent prop1="test" />);
    expect(getByText('test')).toBeTruthy();
  });
  
  it('handles user interaction', () => {
    const { getByTestId } = render(<MyComponent prop1="test" />);
    fireEvent.press(getByTestId('button'));
    // Assert expected behavior
  });
});
```

### Test Coverage
- Aim for **80%+ coverage** on new code
- Test **user interactions**
- Test **error conditions**
- Test **edge cases**

## 📚 Documentation

### Code Documentation
- **JSDoc comments** for functions
- **README updates** for new features
- **Inline comments** for complex logic
- **Type definitions** for better IDE support

### Documentation Updates
- Update relevant README sections
- Add examples for new features
- Update API documentation
- Include screenshots for UI changes

## 🐛 Reporting Issues

### Before Creating an Issue
- [ ] Check existing issues
- [ ] Search closed issues
- [ ] Verify it's not a duplicate

### Issue Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. iOS 15, Android 11]
- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- App Version: [e.g. 1.0.0]
- Expo Version: [e.g. 49.0.0]

## Additional Context
Any other context about the problem
```

## 🏷️ Labels

We use labels to categorize issues and PRs:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: low` - Low priority

## 🎯 Areas for Contribution

### High Priority
- **Performance optimizations**
- **Accessibility improvements**
- **Error handling enhancements**
- **Test coverage improvements**

### Medium Priority
- **New workout types**
- **UI/UX improvements**
- **Documentation updates**
- **Code refactoring**

### Low Priority
- **Code style improvements**
- **Minor bug fixes**
- **Feature requests**
- **Documentation typos**

## 📞 Getting Help

- **GitHub Discussions** - General questions
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time chat (if available)
- **Email** - Direct contact for sensitive issues

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Project documentation**

Thank you for contributing to Reform! 🚀
