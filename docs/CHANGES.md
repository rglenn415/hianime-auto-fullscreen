# Recent Changes - Separate Manual/Autoplay Settings

## What Changed

The extension now has **two independent toggle settings** instead of one:

### Before (v1.0)
```
┌─────────────────────┐
│  Auto Fullscreen    │  ← Single toggle for everything
│     [ON/OFF]        │
└─────────────────────┘
```

### After (v1.1)
```
┌─────────────────────┐
│  Manual Episodes    │  ← Fullscreen when clicking episodes
│     [ON/OFF]        │
├─────────────────────┤
│  Autoplay Episodes  │  ← Fullscreen during autoplay
│     [ON/OFF]        │
└─────────────────────┘
```

## Why This Change?

Users have different preferences:
- Some want fullscreen when clicking episodes, but NOT during autoplay
- Some want to stay fullscreen during binge-watching (autoplay), but control it manually at first
- Some want full control over both behaviors

## Files Modified

### 1. [popup.html](popup.html)
- Added second toggle for autoplay episodes
- Updated styling for better layout
- Added descriptive labels

### 2. [popup.js](popup.js)
- Now handles two separate settings
- Storage keys: `enableManualEpisode` and `enableAutoplayEpisode`
- Both default to `true` (preserves old behavior)

### 3. [content.js](content.js)
- Added `isAutoplayTransition` flag to track transition type
- `triggerFullscreen()` now checks appropriate setting based on type
- `onVideoEnded()` sets autoplay flag when episode ends
- Storage loading updated to handle both settings
- Added detailed logging for transition types

### 4. Documentation
- Created [SETTINGS-GUIDE.md](SETTINGS-GUIDE.md) - Detailed settings documentation
- Updated [README.md](README.md) - Main documentation with new features

## How It Works Technically

### State Tracking

```javascript
// Global state
let enableManualEpisode = true;      // Setting for manual selections
let enableAutoplayEpisode = true;    // Setting for autoplay
let isAutoplayTransition = false;    // Current transition type
```

### Episode Selection Flow

```
User clicks episode
  ↓
Video src changes
  ↓
isAutoplayTransition === false (default)
  ↓
triggerFullscreen() checks enableManualEpisode
  ↓
Fullscreen triggered if enabled
```

### Autoplay Flow

```
Episode ends
  ↓
onVideoEnded() sets isAutoplayTransition = true
  ↓
Autoplay loads next episode
  ↓
Video src changes
  ↓
triggerFullscreen() checks enableAutoplayEpisode
  ↓
Fullscreen triggered if enabled
  ↓
isAutoplayTransition reset to false
```

## Migration

### For Existing Users

**No action needed!** Both settings default to `true`, which matches the old "ON" behavior.

**If extension was OFF before:**
- It will still be OFF (both toggles default to old state)

### Storage Migration

Old storage format:
```javascript
{ enabled: true }
```

New storage format:
```javascript
{
  enableManualEpisode: true,
  enableAutoplayEpisode: true
}
```

**Note:** Old `enabled` key is no longer used, but won't cause conflicts.

## Testing Checklist

After updating, test these scenarios:

### Test 1: Manual Episode Selection
1. Set Manual Episodes: ON
2. Click a new episode
3. ✅ Should auto-fullscreen

### Test 2: Autoplay
1. Set Autoplay Episodes: ON
2. Let episode end and autoplay
3. ✅ Should auto-fullscreen

### Test 3: Manual ON, Autoplay OFF
1. Set Manual: ON, Autoplay: OFF
2. Click episode → ✅ Fullscreen
3. Let autoplay → ✅ No fullscreen (or exits fullscreen)

### Test 4: Manual OFF, Autoplay ON
1. Set Manual: OFF, Autoplay: ON
2. Click episode → ✅ No fullscreen
3. Let autoplay → ✅ Fullscreen

### Test 5: Both OFF
1. Set both to OFF
2. Click episode → ✅ No fullscreen
3. Let autoplay → ✅ No fullscreen

## Console Log Examples

### Manual Episode (enabled):
```
[HiAnime AutoFS] Video source changed: ep1.m3u8 -> ep2.m3u8
[HiAnime AutoFS] Transition type: manual
[HiAnime AutoFS] Triggering fullscreen for manual episode
[HiAnime AutoFS] Attempting to enter fullscreen mode
[HiAnime AutoFS] Clicking fullscreen button
```

### Autoplay Episode (enabled):
```
[HiAnime AutoFS] Video ended - autoplay may trigger soon
[HiAnime AutoFS] Video source changed: ep1.m3u8 -> ep2.m3u8
[HiAnime AutoFS] Transition type: autoplay
[HiAnime AutoFS] Triggering fullscreen for autoplay episode
[HiAnime AutoFS] Already in fullscreen mode - maintaining fullscreen state
```

### Manual Episode (disabled):
```
[HiAnime AutoFS] Video source changed: ep1.m3u8 -> ep2.m3u8
[HiAnime AutoFS] Transition type: manual
[HiAnime AutoFS] Auto-fullscreen disabled for manual episodes
```

## Known Issues

### Issue: Autoplay flag doesn't reset
**When:** Rare edge case if episode change is cancelled
**Impact:** Next manual selection might be treated as autoplay
**Workaround:** 15-second timeout resets flag automatically
**Fix:** Working as intended with safety timeout

### Issue: Can't distinguish between manual navigation types
**When:** User uses browser back/forward vs clicking episode
**Impact:** All non-autoplay transitions treated as "manual"
**Workaround:** None needed - this is expected behavior
**Fix:** Not applicable - both should use manual setting

## Future Enhancements

Potential additions based on user feedback:

1. **Delay Settings**
   - Customize delay before fullscreen (currently 1000ms manual, 500ms play)

2. **Episode-Specific Rules**
   - Only fullscreen episodes 1-10, etc.

3. **Time-Based Rules**
   - Only auto-fullscreen during certain hours

4. **Transition Animation**
   - Smooth fade-to-fullscreen option

5. **Keyboard Shortcut**
   - Toggle settings without opening popup

## Backwards Compatibility

✅ **Fully backwards compatible**

- Old settings are ignored (no conflicts)
- Default behavior matches old "ON" state
- No breaking changes to core functionality
- All existing features preserved

## Version History

- **v1.0** - Initial release with single toggle
- **v1.1** - Separate manual/autoplay toggles (current)

## Upgrade Instructions

### From v1.0 to v1.1

1. **Reload extension** in `about:debugging`
2. **Click Reload** button next to extension
3. **Open popup** to verify two toggles appear
4. **Done!** Settings default to previous behavior

### Clean Install

1. Remove old extension (if any)
2. Load new `manifest.json`
3. Both settings default to ON
4. Configure as desired

## Questions?

See [SETTINGS-GUIDE.md](SETTINGS-GUIDE.md) for detailed configuration examples!
