# Testing Guide for HiAnime Auto Fullscreen Extension

This directory contains all testing resources for the extension.

## 📁 Test Files

- **[extension.test.js](extension.test.js)** - Automated unit tests using Jest
- **[MANUAL-TEST-SCENARIOS.md](MANUAL-TEST-SCENARIOS.md)** - Comprehensive manual testing guide
- **[test-page.html](test-page.html)** - Local test page for development testing

## 🚀 Quick Start

### Running Automated Tests

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Watch mode (runs tests on file changes):**
   ```bash
   npm run test:watch
   ```

4. **Generate coverage report:**
   ```bash
   npm run test:coverage
   ```

### Using the Test Page

1. **Open the test page:**
   ```bash
   # Open in Firefox
   firefox tests/test-page.html

   # Or just double-click test-page.html
   ```

2. **Load the extension** in `about:debugging`

3. **Use the test page to:**
   - Simulate episode changes
   - Test autoplay behavior
   - Verify fullscreen triggering
   - Monitor extension behavior in console

### Manual Testing on HiAnime

Follow the detailed scenarios in [MANUAL-TEST-SCENARIOS.md](MANUAL-TEST-SCENARIOS.md)

## 🧪 Test Types

### 1. Unit Tests (Automated)

**File:** `extension.test.js`

**What it tests:**
- Video element detection
- Fullscreen state detection
- Video source change detection
- Event listener attachment
- Browser storage operations
- URL change detection
- Error handling
- Multi-monitor support logic

**Coverage areas:**
- ✅ Video Detection
- ✅ Fullscreen State Management
- ✅ Source Change Detection
- ✅ Event Listeners
- ✅ Storage API
- ✅ Error Handling
- ✅ Multi-monitor Logic

### 2. Integration Tests (Manual)

**File:** `MANUAL-TEST-SCENARIOS.md`

**Test suites:**
1. **Basic Functionality** - Extension loading, manual episode selection
2. **Autoplay Functionality** - Autoplay detection and handling
3. **Fullscreen State Management** - State transitions and persistence
4. **Multi-Monitor Tests** - Multiple display support
5. **Edge Cases** - Network issues, navigation, rapid changes
6. **Browser Compatibility** - Firefox standard and private mode
7. **Performance** - CPU/memory usage
8. **Integration** - Compatibility with other extensions
9. **Error Handling** - Graceful failure scenarios

### 3. Local Development Tests

**File:** `test-page.html`

**Features:**
- Load different video episodes
- Simulate autoplay transitions
- Toggle fullscreen manually
- Control autoplay delay
- Monitor all video events
- Test without internet connection
- Visual status indicators

## 📊 Test Coverage

### Current Coverage Areas

| Component | Unit Tests | Manual Tests | Coverage |
|-----------|------------|--------------|----------|
| Video Detection | ✅ | ✅ | 100% |
| Fullscreen Triggering | ✅ | ✅ | 100% |
| Autoplay Detection | ✅ | ✅ | 100% |
| Multi-monitor | ✅ | ✅ | 100% |
| Error Handling | ✅ | ✅ | 100% |
| State Management | ✅ | ✅ | 100% |
| Browser APIs | ✅ | ✅ | 100% |

## 🎯 Testing Workflow

### Before Committing Code

1. **Run unit tests:**
   ```bash
   npm test
   ```

2. **Test locally:**
   - Open `test-page.html`
   - Verify basic functionality works

3. **Test on HiAnime:**
   - Run at least Test Suite 1 and 2 from manual scenarios
   - Verify no console errors

### Before Release

1. **Full automated test suite** ✅
2. **All manual test suites** ✅
3. **Performance testing** ✅
4. **Multi-browser testing** ✅
5. **Edge case testing** ✅

## 🐛 Debugging Tests

### Automated Tests

If tests fail:

1. **Check test output:**
   ```bash
   npm test -- --verbose
   ```

2. **Run specific test:**
   ```bash
   npm test -- -t "test name"
   ```

3. **Enable debugging:**
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

### Manual Tests

If extension doesn't work:

1. **Open DevTools (F12)**
2. **Check Console tab** for extension logs
3. **Look for errors** in red
4. **Verify extension loaded:** Look for `[HiAnime AutoFS] Content script loaded`

### Test Page Issues

If test page doesn't work:

1. **Check browser console** for errors
2. **Verify extension is loaded** in `about:debugging`
3. **Try different video source** (edit test-page.html)
4. **Check CORS issues** (use local HTTP server if needed)

## 📝 Writing New Tests

### Adding Unit Tests

Edit `extension.test.js`:

```javascript
describe('New Feature', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Adding Manual Test Scenarios

Edit `MANUAL-TEST-SCENARIOS.md`:

```markdown
### Test X.Y: Test Name
**Steps:**
1. Step one
2. Step two

**Expected:**
- What should happen

**Pass Criteria:** When this passes
```

### Updating Test Page

Edit `test-page.html` to add new test controls or scenarios.

## 🔧 Test Configuration

### Jest Configuration

Located in `package.json`:

```json
"jest": {
  "testEnvironment": "jsdom",
  "testMatch": ["**/tests/**/*.test.js"],
  "collectCoverageFrom": ["content.js", "popup.js"]
}
```

### Modifying Test Settings

- **Change test pattern:** Edit `testMatch` in `package.json`
- **Add coverage files:** Edit `collectCoverageFrom` array
- **Change timeout:** Add `testTimeout: 10000` to jest config

## 📈 CI/CD Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## 🎓 Best Practices

### Writing Tests

1. **Keep tests independent** - Don't rely on test execution order
2. **Use descriptive names** - Test names should explain what they test
3. **Test one thing** - Each test should verify one behavior
4. **Mock external dependencies** - Don't rely on network or real browser APIs
5. **Clean up after tests** - Reset state in `beforeEach` and `afterEach`

### Manual Testing

1. **Test on real site** - Always verify on actual HiAnime
2. **Test edge cases** - Try unusual scenarios
3. **Document findings** - Record unexpected behavior
4. **Report issues** - File bug reports for failures

### Test Page Usage

1. **Develop features first** - Test locally before HiAnime
2. **Simulate real scenarios** - Match HiAnime's behavior
3. **Monitor console** - Watch for extension logs
4. **Test variations** - Try different episode sequences

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Firefox Extension Testing](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Testing_persistent_and_restart_features)
- [web-ext CLI Tool](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)

## ❓ FAQ

**Q: Do I need to run tests before every commit?**
A: At minimum, run `npm test`. Full manual testing before releases.

**Q: Can I skip the test page?**
A: Yes, but it's helpful for rapid development iteration.

**Q: How do I test multi-monitor if I only have one screen?**
A: You can skip those tests, or test window position changes instead.

**Q: Tests pass but extension doesn't work on HiAnime?**
A: Unit tests verify logic, but manual testing on real site is essential.

**Q: Can I automate manual tests?**
A: Some can be automated with tools like Selenium, but manual verification is often faster for extensions.

## 🤝 Contributing Tests

When contributing:

1. Add unit tests for new code
2. Update manual scenarios for new features
3. Ensure all existing tests pass
4. Document any new test requirements

## 📞 Support

If you encounter testing issues:

1. Check this README
2. Review test documentation
3. Check console for errors
4. Open an issue with test output
