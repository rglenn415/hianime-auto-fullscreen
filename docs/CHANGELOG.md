# Changelog

All notable changes to the HiAnime Auto Fullscreen extension will be documented in this file.

## [1.0.2] - 2026-01-10

### Fixed
- **Mid-Episode Resume**: Fullscreen now triggers correctly when resuming episodes from the middle
  - Added episode ID tracking via URL parameter (`?ep=`) to detect episode transitions
  - Extended player load delay (1.5s) to ensure video is ready when resuming
  - Fullscreen triggers on initial page load for new episodes
  - Works with HiAnime's "Continue Watching" feature

### Added
- **Additional Icon Sizes**: Added 64x64 and 128x128 icon sizes
  - Updated icon generation scripts to create all 6 sizes (16, 32, 48, 64, 96, 128)
  - Updated manifest.json with new icon references

### Technical Details

**Episode Detection** (`src/content.js:329-333`):
- New `getEpisodeId()` function extracts episode ID from URL
- Tracks `lastEpisodeUrl` separately from video source

**URL Change Handling** (`src/content.js:335-373`):
- `checkUrlChange()` now compares episode IDs to detect true episode transitions
- Triggers fullscreen proactively when navigating to a new episode
- Handles both fresh starts and mid-episode resumes

**Initialization** (`src/content.js:375-419`):
- `init()` now triggers fullscreen on first load when episode is detected
- Uses 1.5 second delay to account for resume position loading

---

## [1.0.1] - 2026-01-04

### Added
- **Movie Support**: Extension now works on HiAnime movies (previously only worked on TV series episodes)
  - Added iframe-based player detection for movies
  - Implemented dual-mode player detection (iframe and direct video elements)
  - Added MutationObserver to monitor iframe src attribute changes
  - Updated fullscreen targeting to support iframe containers

- **Server Switching Detection**: Extension now detects and handles video server changes
  - Supports HD-1, HD-2, SUB, and DUB server switching
  - Server switches are treated as manual transitions (respects "Manual episode fullscreen" toggle)
  - Added dedicated tests for server switching scenarios

- **Icon Support**: Added extension icons for Firefox
  - Icons configured in manifest: 16x16, 32x32, 48x48, 96x96
  - Created automated icon generation scripts (Node.js and Python versions)
  - Icons will be included in build automatically

### Changed
- **Project Structure**: Reorganized directory layout for better maintainability
  - Moved source files to `src/` directory
  - Moved tests to `tests/` directory
  - Created `scripts/` directory for build and utility scripts
  - Created `docs/` directory for documentation
  - Created `analysis/` directory for research and investigation files
  - Updated build process to use `--source-dir=src`

- **Build Process**: Enhanced build verification
  - Build script now verifies icons directory exists
  - Shows file count for directories during verification
  - Updated to package only essential files from src/

- **Test Coverage**: Expanded test suite from 47 to 74 tests
  - Added 8 tests for iframe player detection
  - Added 5 tests for server switching detection
  - Added 5 tests for MutationObserver iframe monitoring
  - Added 4 tests for player type handling
  - Added 5 tests for episode transition types
  - All 74 tests passing

### Fixed
- **Validation Warnings**: Resolved all Mozilla Add-ons validator warnings
  - Fixed FLAGGED_FILE_EXTENSION warnings (removed development files)
  - Fixed FLAGGED_FILE_TYPE warnings (removed Python scripts from package)
  - Fixed INLINE_SCRIPT warnings (removed test HTML files)
  - Fixed UNSAFE_VAR_ASSIGNMENT warnings
  - Final validation: 0 errors, 0 warnings, 0 notices

- **Build Artifacts**: Removed unnecessary files from build
  - Removed .webextignore files (no longer needed with --source-dir)
  - Removed coverage/ directory from builds
  - Removed development scripts from package

### Technical Details

#### Core Functionality Changes

**Player Detection** (`src/content.js:49-74`):
- `findVideoPlayer()` now prioritizes iframe detection over video elements
- Searches for `#iframe-embed` and iframes with `allow="fullscreen"` attribute
- Falls back to direct video element detection if no iframe found

**Source Change Detection** (`src/content.js:165-196`):
- `onVideoSourceChange()` handles both iframe.src and video.src/currentSrc
- Different logic paths for iframe vs video element source tracking
- Detects server switches by comparing iframe src changes

**Event Monitoring** (`src/content.js:244-282`):
- `attachVideoListeners()` uses MutationObserver for iframes
- Monitors iframe src attribute changes (can't access cross-origin iframe events)
- Maintains existing event listeners for direct video elements

#### Files Modified
- `src/manifest.json` - Added icons configuration, version bump to 1.0.1
- `src/content.js` - Added iframe support, dual-mode player detection
- `tests/extension.test.js` - Added 27 new tests for iframe and server switching
- `scripts/build-clean.js` - Added icons directory verification
- `package.json` - Updated scripts and paths for new structure

#### New Files Added
- `scripts/generate-icons.js` - Node.js icon generation script (uses sharp)
- `scripts/generate-icons.py` - Python icon generation script (uses Pillow)
- `docs/CHANGELOG.md` - This changelog
- `analysis/movie_analysis.md` - HiAnime movie page structure analysis

---

## [1.0.0] - Initial Release

### Features
- Auto-fullscreen for HiAnime episode playback
- Separate toggles for manual vs autoplay episode selection
- Manual episode fullscreen: Triggers when user clicks on an episode
- Autoplay episode fullscreen: Triggers when episodes auto-advance
- Browser storage for user preferences
- Popup interface for easy toggle control
- Support for TV series episodes on hianime.to

### Technical Implementation
- Content script injection on hianime.to pages
- Video element detection and monitoring
- Play event and ended event listeners
- Episode transition detection via URL changes
- MutationObserver for DOM changes
- Fullscreen API with browser prefix support (moz, webkit, ms)
- Debug logging system for troubleshooting

### Testing
- 47 unit tests using Jest
- jsdom test environment
- Coverage for core functionality, user preferences, episode transitions
- Test coverage: content.js and popup.js

### Privacy
- No data collection
- All preferences stored locally in browser
- No external network requests
- Privacy policy: https://github.com/rglenn415/hianime-auto-fullscreen/blob/master/PRIVACY.md
