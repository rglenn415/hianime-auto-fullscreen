# Settings Guide

The extension now has two independent toggle settings for better control over when fullscreen is triggered.

## Available Settings

### 1. Manual Episodes
**Controls:** Auto-fullscreen when you manually select/click an episode

**When it triggers:**
- You click on a new episode from the episode list
- You use the "Next Episode" button
- You navigate directly to an episode URL

**Use cases:**
- ✅ Turn ON if you want fullscreen when clicking episodes
- ❌ Turn OFF if you prefer to manually click fullscreen each time

---

### 2. Autoplay Episodes
**Controls:** Auto-fullscreen when autoplay transitions to the next episode

**When it triggers:**
- Current episode ends
- HiAnime's autoplay feature loads the next episode automatically

**Use cases:**
- ✅ Turn ON if you want to stay in fullscreen during binge-watching
- ❌ Turn OFF if you want to exit fullscreen between episodes

---

## Common Configurations

### 🎬 Configuration 1: Full Auto (Default)
```
Manual Episodes:  ✅ ON
Autoplay Episodes: ✅ ON
```
**Behavior:** Always goes fullscreen, whether you click or autoplay
**Best for:** Binge-watching, hands-free viewing

---

### 🖱️ Configuration 2: Manual Control Only
```
Manual Episodes:  ✅ ON
Autoplay Episodes: ❌ OFF
```
**Behavior:** Fullscreen when you click episodes, but exits between autoplay
**Best for:** When you want to check notifications between episodes

---

### ⏭️ Configuration 3: Autoplay Only
```
Manual Episodes:  ❌ OFF
Autoplay Episodes: ✅ ON
```
**Behavior:** No fullscreen when clicking, but maintains fullscreen during autoplay
**Best for:** Starting in windowed mode, but staying fullscreen once binge-watching

---

### 🚫 Configuration 4: Fully Disabled
```
Manual Episodes:  ❌ OFF
Autoplay Episodes: ❌ OFF
```
**Behavior:** Extension does nothing, you control fullscreen manually
**Best for:** Temporarily disabling the extension

---

## How to Access Settings

1. **Click the extension icon** in your Firefox toolbar
2. **Toggle the switches** for your preferred settings
3. **Changes take effect immediately** - no need to reload

---

## Console Logs

When debug mode is enabled (default), you'll see these messages:

### Manual Episode Selection:
```
[HiAnime AutoFS] Video source changed: old.m3u8 -> new.m3u8
[HiAnime AutoFS] Transition type: manual
[HiAnime AutoFS] Triggering fullscreen for manual episode
```

### Autoplay Episode:
```
[HiAnime AutoFS] Video ended - autoplay may trigger soon
[HiAnime AutoFS] Video source changed: old.m3u8 -> new.m3u8
[HiAnime AutoFS] Transition type: autoplay
[HiAnime AutoFS] Triggering fullscreen for autoplay episode
```

### Setting Disabled:
```
[HiAnime AutoFS] Auto-fullscreen disabled for manual episodes
```
or
```
[HiAnime AutoFS] Auto-fullscreen disabled for autoplay episodes
```

---

## Technical Details

### How It Works

The extension tracks two states:

1. **`isAutoplayTransition` flag**
   - Set to `false` by default (manual)
   - Set to `true` when video `ended` event fires
   - Reset after fullscreen is triggered or timeout (15s)

2. **Episode transition detection**
   - Monitors video `src` changes
   - Checks the `isAutoplayTransition` flag
   - Applies the appropriate setting

### Storage Keys

Settings are stored in browser local storage:

```javascript
{
  enableManualEpisode: true,    // Manual Episodes toggle
  enableAutoplayEpisode: true   // Autoplay Episodes toggle
}
```

### Code Flow

```
User clicks episode
  ↓
Video src changes
  ↓
isAutoplayTransition = false
  ↓
Check enableManualEpisode setting
  ↓
Trigger fullscreen (if enabled)
```

```
Episode ends
  ↓
Set isAutoplayTransition = true
  ↓
Autoplay loads next episode
  ↓
Video src changes
  ↓
Check enableAutoplayEpisode setting
  ↓
Trigger fullscreen (if enabled)
  ↓
Reset isAutoplayTransition = false
```

---

## Troubleshooting

### Setting doesn't seem to work

1. **Check the console (F12)**
   - Look for `[HiAnime AutoFS]` messages
   - Verify which setting is being checked

2. **Verify setting is saved**
   - Close and reopen the popup
   - Check if toggle persists

3. **Reload the page**
   - Changes should work immediately, but reload if uncertain

### Both settings are ON but fullscreen doesn't trigger

1. Check console for error messages
2. Verify extension is loaded: `about:debugging`
3. Check if HiAnime changed their player structure

### Fullscreen triggers for wrong type

1. Open console (F12)
2. Watch for "Transition type: manual" or "Transition type: autoplay"
3. Report issue if misdetected

---

## Migration from Old Version

If you used the extension before this update:

**Old behavior:**
- Single "Auto Fullscreen" toggle
- Controlled everything

**New behavior:**
- Two separate toggles
- **Both default to ON** (same as old "ON" state)

**Action needed:** None - existing behavior is preserved!

---

## Feature Requests

Want additional settings? Common requests:

- ⏱️ Delay before fullscreen
- 🎯 Specific episodes only
- 🌙 Time-based rules (e.g., only at night)

Let us know in the issues!
