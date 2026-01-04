Firefox Add-on Update Guide

## Updating Your Published Firefox Add-on

### Step 1: Update Version Number

**Semantic Versioning (MAJOR.MINOR.PATCH):**
- **PATCH** (1.0.x): Bug fixes, small tweaks
- **MINOR** (1.x.0): New features, backwards compatible
- **MAJOR** (x.0.0): Breaking changes

**For iframe support update:** 1.0.0 → 1.1.0 (new feature)

Edit `manifest.json`:
```json
"version": "1.1.0"
```

### Step 2: Disable Debug Mode

Edit `content.js` line 9:
```javascript
DEBUG_MODE: false  // Changed from true
```

This hides console logs from users.

### Step 3: Update CHANGELOG

Create or update CHANGELOG.md:
```markdown
# Changelog

## [1.1.0] - 2024-01-XX

### Added
- Support for iframe-based video players (movies)
- Server switching detection (HD-1, HD-2, SUB, DUB)
- MutationObserver for iframe src monitoring

### Fixed
- Extension now works on movie pages
- Improved player detection for different HiAnime layouts

### Technical
- Dual-mode player detection (iframe + video)
- Enhanced fullscreen targeting for iframe containers

## [1.0.0] - 2024-12-XX

### Initial Release
- Auto-fullscreen on manual episode selection
- Auto-fullscreen on autoplay episodes
- Separate toggles for manual vs autoplay
- Multi-monitor support
```

### Step 4: Run Tests

```bash
# Run all tests
npm test

# Ensure all 47 tests pass
```

### Step 5: Build the Extension

```bash
# Build production package
npm run build

# This creates: web-ext-artifacts/hianime_auto_fullscreen-1.1.0.zip
```

### Step 6: Lint the Extension

```bash
# Check for issues
npm run lint

# Fix any errors before proceeding
```

### Step 7: Test the Build

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the built `.zip` file
4. Test thoroughly:
   - [ ] Movies with iframe players
   - [ ] Server switching (HD-1, HD-2)
   - [ ] Regular episodes
   - [ ] Both toggles work
   - [ ] No console errors

### Step 8: Submit to Firefox Add-ons

1. **Login** to https://addons.mozilla.org/developers/
2. Click on your add-on (HiAnime Auto Fullscreen)
3. Click **"Upload New Version"**
4. **Upload** the `.zip` file from `web-ext-artifacts/`
5. **Fill in version notes:**

```
Version 1.1.0 Update

New Features:
- Added support for iframe-based video players (movies now work!)
- Server switching (HD-1, HD-2, SUB, DUB) now triggers fullscreen
- Improved player detection across different HiAnime layouts

Bug Fixes:
- Extension now properly detects and fullscreens movie content
- Enhanced fullscreen targeting for different player types

Technical Improvements:
- Implemented MutationObserver for real-time iframe monitoring
- Dual-mode detection system (iframe + direct video)
- Better separation between manual and autoplay transitions
```

6. **Do you need to submit source code?**
   - No (no minification or bundling)

7. **Submit for Review**

### Step 9: Review Process

**Timeline:**
- Automated validation: Instant
- Human review: 1-7 days (typically 2-3 days)

**Common Review Issues:**
- Missing privacy policy → Already have PRIVACY.md
- Unclear permissions → Already have PERMISSIONS.md
- Code quality → Already reviewed

**Status Notifications:**
- You'll get email when approved/rejected
- Check developer dashboard for status

### Step 10: After Approval

**Users get updates automatically:**
- Firefox checks for updates every 24 hours
- Users auto-update when they restart Firefox
- Force check: `about:addons` → gear icon → "Check for Updates"

**Update propagation:**
- Available on AMO: Immediately after approval
- Users receive it: Within 24-48 hours


## Quick Reference Commands

```bash
# Local development
npm test              # Run tests
npm run lint          # Check for errors
npm run build         # Build .zip package

# Load in Firefox
# Go to: about:debugging#/runtime/this-firefox
# Click: "Load Temporary Add-on"
# Select: web-ext-artifacts/hianime_auto_fullscreen-1.1.0.zip

# Reload after changes
# Click "Reload" button in about:debugging
```


## Version History

| Version | Release Date | Changes |
|---------|-------------|---------|
| 1.0.0   | 2024-12-XX  | Initial release |
| 1.1.0   | 2024-01-XX  | Iframe support, server switching |


## Pre-Release Checklist

Before submitting update:

- [ ] Version bumped in manifest.json
- [ ] DEBUG_MODE set to false
- [ ] CHANGELOG.md updated
- [ ] All tests passing (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] Extension built (`npm run build`)
- [ ] Tested movie pages work
- [ ] Tested server switching works
- [ ] Tested regular episodes still work
- [ ] Both toggles tested
- [ ] No console errors in production build


## Hotfix Process (Emergency Updates)

If critical bug found after release:

1. **Bump PATCH version:** 1.1.0 → 1.1.1
2. **Fix the bug** in code
3. **Test thoroughly**
4. **Build and submit** (same process as above)
5. **Mark as urgent** in submission notes:
   ```
   HOTFIX: Critical bug affecting [describe issue]

   This update fixes [specific problem] that was causing [impact on users].
   ```
6. Mozilla may expedite review for critical fixes


## Rollback (If Update Has Issues)

If approved update causes problems:

1. **Cannot delete** a published version
2. **Can publish** a new version that reverts changes:
   - Version 1.1.1 with old 1.0.0 code
3. **Or fix forward:** Version 1.1.1 with the fix
4. Users will auto-update to the newest version


## Beta Channel (Optional)

To test updates with users before full release:

1. Create **unlisted version** on AMO
2. Set channel to "Unlisted"
3. Share direct download link with testers
4. After testing, submit as listed version
5. Unlisted versions don't appear in search


## Monitoring After Release

**Check for issues:**
- AMO reviews/ratings
- GitHub issues: https://github.com/rglenn415/hianime-auto-fullscreen/issues
- User reports

**Metrics available on AMO dashboard:**
- Daily users
- Download count
- Average rating
- Version adoption rate
