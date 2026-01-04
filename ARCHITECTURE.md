HiAnime Auto Fullscreen Extension - Technical Architecture

## Video Player Detection Strategy

The extension uses a **dual-mode detection system** to handle different player types on HiAnime:

### Mode 1: Iframe-based Players (Movies, Some Episodes)

**Detection:** `#iframe-embed` or `iframe[allow*="fullscreen"]`

**How it works:**
- HiAnime loads the video player inside an iframe
- The actual `<video>` element is inside the iframe (inaccessible due to same-origin policy)
- Extension monitors the **iframe's `src` attribute** for changes

**Event Detection:**
```javascript
// MutationObserver watches iframe src attribute
const iframeObserver = new MutationObserver((mutations) => {
  if (mutation.attributeName === 'src') {
    // Iframe source changed - new server/episode loaded
    onVideoSourceChange();
  }
});
```

**Fullscreen Target:**
- Finds the iframe container: `.watch-player`, `.player-frame`, or `#player`
- Calls `requestFullscreen()` on the container (not the iframe itself)
- This fullscreens the entire player area including controls


### Mode 2: Direct Video Elements (Regular Episodes)

**Detection:** `video`, `#player video`, `.plyr video`

**How it works:**
- HiAnime embeds video player directly in the page
- Extension can access the `<video>` element directly
- Listens to video events: `play`, `ended`, `loadedmetadata`, etc.

**Event Detection:**
```javascript
video.addEventListener('ended', onVideoEnded);
video.addEventListener('playing', onVideoPlay);
// ... etc
```

**Fullscreen Target:**
- Finds video container: `.plyr`, `.video-player`, or `#player`
- Calls `requestFullscreen()` on the container


## Server Switching (HD-1, HD-2, SUB, DUB)

### How HiAnime Implements Server Switching

When a user clicks a server button (HD-1, HD-2, SUB, DUB):
1. JavaScript updates the iframe's `src` attribute
2. New video source URL is loaded in the iframe
3. Player reinitializes with new source

### How the Extension Detects This

**For Iframe Players:**
```javascript
// MutationObserver detects src attribute change
iframe.src changes from:
  "https://example.com/embed/hd1/12345"
to:
  "https://example.com/embed/hd2/12345"

// Extension triggers:
1. onVideoSourceChange() detects src change
2. Classifies as "manual" transition (user clicked button)
3. Triggers fullscreen if "Manual episode" toggle is ON
```

**Classification:**
- Server switching is treated as a **manual transition** (not autoplay)
- Respects the "Auto-fullscreen on manual episode selection" toggle
- User intentionally clicked a button → manual action


### Edge Cases

**Case 1: Multiple rapid server switches**
- Extension debounces with 1-second delay (FULLSCREEN_DELAY_MS)
- Only the last switch triggers fullscreen

**Case 2: Same server re-selected**
- iframe src doesn't change → no fullscreen triggered
- This is correct behavior (no new episode loaded)

**Case 3: Ad iframes**
- If HiAnime uses different iframe for ads, extension won't trigger
- Only monitors `#iframe-embed` specifically


## Episode Transition Detection

### Manual Episode Selection

**Trigger:** User clicks episode in episode list

**Detection method:**
1. URL changes: `?ep=15804` → `?ep=15805`
2. Iframe src changes to new episode
3. Both URL change AND src change detected

**Flow:**
```
User clicks episode
  → URL changes (checkUrlChange detects)
  → Iframe src changes (MutationObserver detects)
  → isAutoplayTransition = false (manual)
  → triggerFullscreen() with manual setting
```


### Autoplay Episode Transition

**Trigger:** Episode finishes, next episode auto-loads

**Detection method (Iframe):**
- Cannot detect `video.ended` event (inside iframe)
- Relies on **periodic polling** every 2 seconds
- Detects iframe src change when autoplay loads next episode

**Detection method (Video):**
- Listens to `video.ended` event
- Sets `isAutoplayTransition = true`
- Monitors for src change with higher frequency (200ms) for 15 seconds

**Flow:**
```
Episode ends
  → video.ended event (if accessible)
  → isAutoplayTransition = true
  → Autoplay loads next episode
  → Iframe src changes
  → triggerFullscreen() with autoplay setting
```


## Fullscreen Triggering Strategy

### Priority Order

1. **Click fullscreen button** (if found)
   - Searches for: `.plyr__controls button[data-plyr="fullscreen"]`
   - Advantage: Uses native player controls
   - Disadvantage: Button might not exist or be hidden

2. **Use Fullscreen API** (fallback)
   - Calls `element.requestFullscreen()`
   - Supports browser prefixes: `mozRequestFullScreen`, `webkitRequestFullscreen`
   - Target: Player container (not video element directly)

3. **Multi-monitor support**
   - Browser API respects current monitor placement
   - Fullscreen opens on monitor where Firefox window is located


## Detection Mechanisms Summary

| Mechanism | Purpose | Frequency |
|-----------|---------|-----------|
| MutationObserver (DOM) | Detect new video/iframe elements added | Real-time |
| MutationObserver (Attributes) | Detect iframe src changes | Real-time |
| Video Event Listeners | Detect play, ended, metadata events | Real-time |
| URL Polling | Detect episode changes via URL | Every 2 sec |
| Source Polling | Backup detection for src changes | Every 2 sec |
| Autoplay Polling | High-frequency detection after video ends | Every 200ms for 15sec |
| Fullscreen Events | Detect user exiting fullscreen | Real-time |


## Configuration Constants

```javascript
const CONFIG = {
  DEBUG_MODE: true,              // Console logging (disable for production)
  FULLSCREEN_DELAY_MS: 1000,     // Wait before triggering fullscreen
  PLAY_EVENT_DELAY_MS: 500,      // Wait after play event
  POLL_INTERVAL_MS: 2000,        // General polling frequency
  AUTOPLAY_MONITOR_DURATION_MS: 15000,  // Monitor for autoplay this long
  AUTOPLAY_CHECK_INTERVAL_MS: 200       // High-frequency autoplay polling
};
```


## State Management

```javascript
let enableManualEpisode = true;    // Toggle: Manual episode fullscreen
let enableAutoplayEpisode = true;  // Toggle: Autoplay episode fullscreen
let lastVideoSrc = null;           // Track source changes
let hasTriggeredFullscreen = false; // Prevent duplicate triggers
let isAutoplayTransition = false;  // Distinguish manual vs autoplay
let autoplayCheckInterval = null;  // Track interval for cleanup
```


## Browser Compatibility

**Supported:**
- Firefox 142+ (manifest requirement)
- Fullscreen API with browser prefixes
- MutationObserver (all modern browsers)

**Same-Origin Policy Limitation:**
- Cannot access content inside cross-origin iframes
- This is a browser security feature, not a bug
- Workaround: Monitor iframe element itself, not its contents


## Performance Considerations

**CPU Usage:**
- MutationObserver: Negligible (event-driven)
- 2-second polling: Minimal impact
- 200ms autoplay polling: Only active for 15 seconds after video ends

**Memory:**
- Event listeners cleaned up on page unload
- Intervals cleared after autoplay window
- MutationObserver garbage collected with element

**Optimization:**
- Only one interval runs at a time
- Debouncing prevents rapid fullscreen triggers
- Early returns prevent unnecessary processing


## Future Improvements

1. **Smarter Autoplay Detection:**
   - Use Web Workers to detect iframe content changes
   - Implement message passing with player iframe (if same-origin)

2. **User Preferences:**
   - Delay before fullscreen (user configurable)
   - Specific servers to skip (e.g., never fullscreen on HD-3)

3. **Analytics:**
   - Track success/failure rates
   - Identify problematic player types

4. **Manifest V3:**
   - Migrate to Manifest V3 when Firefox support stabilizes
   - Use service workers instead of background scripts
