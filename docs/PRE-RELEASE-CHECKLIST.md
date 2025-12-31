# Pre-Release Checklist for Firefox Add-ons Store

Complete this checklist before submitting to ensure production readiness.

## ✅ Critical (Must Complete)

### Code Quality
- [x] Debug mode disabled (CONFIG.DEBUG_MODE = false in content.js)
- [x] All console.log statements removed or behind debug flag
- [x] No TODO or FIXME comments in production code
- [x] Magic numbers extracted to constants
- [x] Error handling added to all storage API calls
- [x] Memory leaks fixed (interval tracking in onVideoEnded)
- [ ] Code runs without errors in browser console
- [ ] No warnings in browser console

### Required Files
- [x] LICENSE file created (MIT)
- [x] PRIVACY.md created and comprehensive
- [ ] README.md updated for release
- [x] manifest.json version set to 1.0.0
- [x] package.json version matches manifest (1.0.0)
- [ ] Icons created (16px, 32px, 48px, 96px)

### Manifest.json
- [x] browser_specific_settings added with extension ID
- [x] strict_min_version set (57.0)
- [x] Author field populated
- [x] Homepage URL added
- [x] Description updated
- [x] Version is 1.0.0
- [ ] Extension ID is unique (update from example.com)

### Privacy & Permissions
- [x] PRIVACY.md explains all data collection
- [x] Permissions justified in documentation
- [ ] No external network requests (verified)
- [ ] No analytics or tracking code
- [ ] Storage only used for user preferences

## ⚠️ High Priority (Strongly Recommended)

### Testing
- [ ] Extension loads without errors in about:debugging
- [ ] Manual episode toggle works correctly
- [ ] Autoplay episode toggle works correctly
- [ ] All four setting combinations tested:
  - [ ] Both ON
  - [ ] Manual ON, Autoplay OFF
  - [ ] Manual OFF, Autoplay ON
  - [ ] Both OFF
- [ ] Fullscreen triggers at correct times
- [ ] Settings persist after browser restart
- [ ] Works on clean Firefox profile
- [ ] Tested on Firefox ESR (if applicable)
- [ ] Tested on latest Firefox version
- [ ] Multi-monitor behavior verified (if applicable)

### Documentation
- [x] STORE_LISTING.md created with descriptions
- [ ] Screenshots prepared (5 recommended):
  - [ ] Extension popup
  - [ ] Settings in action
  - [ ] HiAnime fullscreen
  - [ ] Configuration options
  - [ ] Privacy highlights
- [ ] Support URL functional
- [ ] Homepage URL correct and accessible

### Code Review
- [ ] All functions have clear purposes
- [ ] Variable names are descriptive
- [ ] No dead/unreachable code
- [ ] Consistent code style
- [ ] Comments explain complex logic
- [ ] No security vulnerabilities

## 📦 Medium Priority (Nice to Have)

### Polish
- [ ] Extension icon looks professional
- [ ] Popup UI is polished
- [ ] Error messages are user-friendly
- [ ] Settings descriptions are clear
- [ ] Console logs are informative (when debug enabled)

### Documentation
- [ ] CONTRIBUTING.md created
- [ ] Code of Conduct added
- [ ] Issue templates created (if on GitHub)
- [ ] Pull request template created (if on GitHub)

### Future-Proofing
- [ ] Manifest V3 migration plan documented
- [ ] Roadmap for future features created
- [ ] Known issues documented

## 🧪 Automated Tests

### Unit Tests
- [ ] Run `npm test` - all tests pass
- [ ] 43/43 tests passing
- [ ] No test failures or errors
- [ ] Coverage is adequate

### Manual Test Scenarios
- [ ] Test Suite 1: Basic Functionality (3 tests)
- [ ] Test Suite 2: Autoplay Functionality (3 tests)
- [ ] Test Suite 3: Setting Combinations (Test 3.3)

## 🔍 Pre-Submission Verification

### Final Checks
- [ ] Version number in manifest matches package.json
- [ ] No hardcoded secrets or API keys
- [ ] Extension works on HiAnime.to currently
- [ ] No external dependencies loaded at runtime
- [ ] All files necessary for function are included
- [ ] No unnecessary files in build (e.g., node_modules)

### Firefox Store Requirements
- [ ] Extension follows Mozilla's add-on policies
- [ ] No copyright or trademark violations
- [ ] Description is accurate and not misleading
- [ ] Permissions requested are justified
- [ ] Source code will be provided if requested
- [ ] Contact information is valid

## 📝 Submission Preparation

### Files to Include in XPI
```
Required:
- manifest.json
- content.js
- popup.html
- popup.js
- LICENSE
- PRIVACY.md (or link to it)

Optional but Recommended:
- README.md
- icons/ (all sizes)
- CHANGES.md
```

### Files NOT to Include
```
- node_modules/
- tests/
- .git/
- .gitignore
- package.json (unless using npm in extension)
- package-lock.json
- test-page.html
- monitor-autoplay.js
- STORE_LISTING.md (internal)
- PRE-RELEASE-CHECKLIST.md (internal)
- *.test.js files
```

### Build Command
```bash
# Navigate to extension directory
cd c:\Users\skate\hianime

# Create XPI (if using web-ext)
web-ext build --ignore-files tests/ node_modules/ *.md package*.json

# Or manually zip
# Zip: manifest.json, *.js, *.html, LICENSE, icons/
```

## 🚀 Post-Submission

### After Upload
- [ ] Verify version number shows correctly
- [ ] Check all screenshots uploaded
- [ ] Verify description formatting
- [ ] Confirm privacy policy link works
- [ ] Test download and install from store (after approval)

### After Approval
- [ ] Update GitHub with store link
- [ ] Create GitHub release (v1.0.0)
- [ ] Share on social media (optional)
- [ ] Monitor initial reviews
- [ ] Prepare for user feedback

## ⚡ Quick Pre-Flight Check

**Can answer YES to all?**

1. [ ] Debug mode is OFF in production code?
2. [ ] No console.log in popup.js?
3. [ ] LICENSE file exists?
4. [ ] PRIVACY.md explains data usage?
5. [ ] manifest.json has unique extension ID?
6. [ ] Icons added to manifest?
7. [ ] Version is 1.0.0 everywhere?
8. [ ] Extension tested and works on HiAnime?
9. [ ] No errors in browser console?
10. [ ] Ready to submit source code if requested?

**If YES to all above → Ready for submission! 🎉**

## 🆘 Common Issues Before You Submit

### Issue: "Extension doesn't load"
- Check manifest.json syntax (use JSON validator)
- Verify all file paths are correct
- Check browser console for errors

### Issue: "Icons don't show"
- Verify icon files exist in correct location
- Check manifest.json icon paths
- Ensure icons are proper PNG format

### Issue: "Settings don't save"
- Test storage permission is granted
- Check browser console for storage errors
- Verify popup.js has error handling

### Issue: "Fullscreen doesn't trigger"
- Test on actual HiAnime website
- Check if selectors match current HiAnime player
- Enable debug mode temporarily to see logs

## 📞 Support Channels

Before submitting, ensure you have:

- [ ] GitHub repository (or support page) ready
- [ ] Email for support inquiries
- [ ] Way to receive bug reports
- [ ] Plan for handling user feedback

## 🎯 Success Criteria

**Extension is ready when:**

✅ All critical items completed
✅ All high priority items completed
✅ Extension tested on clean Firefox install
✅ No console errors or warnings
✅ Privacy policy comprehensive
✅ Documentation complete
✅ Icons professional quality
✅ Source code ready to share
✅ Support channels established

**Current Status:**

- Critical: ___/15 ✓
- High Priority: ___/20 ✓
- Medium Priority: ___/9 ✓

**Overall Readiness:** ___%

---

**Good luck with your submission! 🚀**

Remember: Firefox reviewers are thorough. Better to over-document than under-document!
