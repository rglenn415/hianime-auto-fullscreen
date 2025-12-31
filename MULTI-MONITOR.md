# Multi-Monitor Fullscreen Support

The extension has been updated to handle multi-monitor setups correctly.

## How It Works

### Key Improvements

1. **Fullscreen State Detection**
   - Checks if already in fullscreen before triggering
   - Maintains fullscreen across episode changes
   - Works with all browser fullscreen APIs (standard, webkit, moz, ms)

2. **Fullscreen Persistence**
   - When you're already in fullscreen and autoplay happens, it stays fullscreen
   - The video switches but fullscreen mode is maintained
   - Only triggers fullscreen if you're NOT already in fullscreen mode

3. **Multi-Monitor Awareness**
   - Uses native fullscreen API with proper options
   - Respects browser's monitor placement
   - Fullscreen stays on the monitor where the browser window is

## Browser Fullscreen Behavior

### How Browsers Handle Multi-Monitor Fullscreen

- **Firefox/Chrome/Edge**: Fullscreen activates on whichever monitor the browser window is currently on
- **Moving windows**: If you move the browser to Monitor 2 before going fullscreen, it will fullscreen on Monitor 2
- **Browser native behavior**: The extension uses the browser's native fullscreen API, so it respects the browser's monitor selection

### What the Extension Does

1. **First Episode**:
   - Detects video starts playing
   - Triggers fullscreen on current monitor

2. **Autoplay to Next Episode**:
   - Detects video source change
   - **Checks if already fullscreen**
   - If YES: Maintains fullscreen, just switches video
   - If NO: Triggers fullscreen again

3. **Manual Fullscreen Exit**:
   - If you exit fullscreen (Esc key)
   - Extension resets and will trigger again on next episode

## Testing Multi-Monitor Setup

Use the monitoring script to see what's happening:

```javascript
// In browser console after loading monitor-autoplay.js
// Watch for these events:

1. FULLSCREEN logs - Shows fullscreen state changes
2. Screen info - Shows window position and screen dimensions
3. Window position changes - Detects if window moves between monitors
```

### Monitor Script Features for Multi-Monitor

The updated [monitor-autoplay.js](monitor-autoplay.js) now tracks:

- **Screen count**: Single or multiple monitors
- **Window position**: `screenX`, `screenY` coordinates
- **Screen dimensions**: Width, height of current screen
- **Position changes**: Logs when window moves (possible monitor switch)

## Expected Behavior

### Scenario 1: Browser on Monitor 1
1. Play episode → Goes fullscreen on Monitor 1
2. Episode ends, autoplay starts → Stays fullscreen on Monitor 1
3. Works perfectly ✅

### Scenario 2: Browser on Monitor 2
1. Play episode → Goes fullscreen on Monitor 2
2. Episode ends, autoplay starts → Stays fullscreen on Monitor 2
3. Works perfectly ✅

### Scenario 3: Move Browser During Playback
1. Episode playing fullscreen on Monitor 1
2. You exit fullscreen (Esc)
3. Move browser window to Monitor 2
4. Next episode starts → Goes fullscreen on Monitor 2
5. Works as expected ✅

## Troubleshooting

### Issue: Fullscreen keeps exiting and re-entering during autoplay

**Cause**: Old behavior - extension was triggering fullscreen even when already fullscreen

**Solution**: Updated! Extension now checks fullscreen state first

**Verify**: Check console logs - should see "Already in fullscreen mode - maintaining fullscreen state"

### Issue: Want to control which monitor goes fullscreen

**Solution**: Move the browser window to your preferred monitor BEFORE starting playback

**Browser behavior**: Fullscreen always activates on the monitor where the browser window currently is

### Issue: Fullscreen doesn't work at all

**Debug steps**:
1. Check console logs (F12) - see if extension is loaded
2. Verify extension is enabled in the popup
3. Look for error messages in console
4. Try manually clicking fullscreen first, then test autoplay

## Console Debug Messages

When working correctly, you'll see:

```
[HiAnime AutoFS] Video ended - autoplay may trigger soon
[HiAnime AutoFS] Video source changed: old.m3u8 -> new.m3u8
[HiAnime AutoFS] Already in fullscreen mode - maintaining fullscreen state
[HiAnime AutoFS] Fullscreen state changed: ENTERED
```

If something's wrong, you might see:

```
[HiAnime AutoFS] Could not find video player or fullscreen button
[HiAnime AutoFS] Fullscreen request failed: [error message]
```

## Advanced: Browser Fullscreen API

The extension uses these APIs in order of preference:

1. **Player's fullscreen button** (preferred) - Uses HiAnime's own button
2. **Native Fullscreen API** (fallback) - Direct browser API

### Why Player Button is Preferred

- Player may have custom fullscreen handling
- Ensures all player controls work correctly
- Maintains player state properly

### When Native API is Used

- If player button can't be found
- Fallback for compatibility
- Still works perfectly for video-only fullscreen

## Future Enhancements

Potential improvements if needed:

1. **Delay customization**: Adjust timing between episodes
2. **Monitor preference**: Remember which monitor you prefer (requires permissions)
3. **Picture-in-Picture**: Alternative to fullscreen for multi-monitor

Currently the extension prioritizes simplicity and reliability!
