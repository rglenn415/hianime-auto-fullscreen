Testing Guide for HiAnime Auto Fullscreen Extension

## Testing Scenarios

### 1. Movie - Iframe-based Player Detection

**URL:** https://hianime.to/watch/memories-936?ep=15804

**Test Steps:**
1. Reload the extension in Firefox (about:debugging)
2. Navigate to the movie URL
3. Open browser console (F12)
4. Check for these logs:
   - [ ] `[HiAnime AutoFS] Content script loaded`
   - [ ] `[HiAnime AutoFS] Initializing HiAnime Auto Fullscreen`
   - [ ] `[HiAnime AutoFS] Found iframe player: iframe-embed`
   - [ ] `[HiAnime AutoFS] Player type: IFRAME`
   - [ ] `[HiAnime AutoFS] Monitoring iframe for src changes`

**Expected Result:** Extension detects iframe player correctly


### 2. Server Switching (HD-1, HD-2, SUB, DUB)

**URL:** Any episode/movie with multiple servers

**Test Steps:**
1. Start playing on HD-1 (or default server)
2. Watch console for: `[HiAnime AutoFS] Iframe src attribute changed`
3. Click on HD-2 (or another server button)
4. Check console for:
   - [ ] `[HiAnime AutoFS] Iframe src attribute changed`
   - [ ] `[HiAnime AutoFS] Video source changed:`
   - [ ] `[HiAnime AutoFS] Transition type: manual`
   - [ ] `[HiAnime AutoFS] Triggering fullscreen for manual episode`

**Expected Result:**
- Extension detects server switch as iframe src change
- Fullscreen is triggered if "Manual episode fullscreen" toggle is ON
- Fullscreen is NOT triggered if toggle is OFF


### 3. Manual Episode Selection (Movie with Multiple Episodes)

**URL:** https://hianime.to/watch/memories-936?ep=15804

**Test Steps:**
1. Play episode 1
2. Manually click on episode 2 in the episode list
3. Check console for:
   - [ ] `[HiAnime AutoFS] URL changed:`
   - [ ] `[HiAnime AutoFS] Iframe src attribute changed`
   - [ ] `[HiAnime AutoFS] Video source changed:`
   - [ ] `[HiAnime AutoFS] Transition type: manual`
   - [ ] `[HiAnime AutoFS] Triggering fullscreen for manual episode`

**Expected Result:** Fullscreen triggers for manual episode change


### 4. Autoplay Episode Transition (Movie)

**URL:** https://hianime.to/watch/memories-936?ep=15804

**Test Steps:**
1. Play episode to completion
2. Wait for autoplay to load next episode
3. Check console for:
   - [ ] `[HiAnime AutoFS] Video ended - autoplay may trigger soon` (if video events work)
   - [ ] `[HiAnime AutoFS] Iframe src attribute changed`
   - [ ] `[HiAnime AutoFS] Transition type: autoplay`
   - [ ] `[HiAnime AutoFS] Triggering fullscreen for autoplay episode`

**Expected Result:** Fullscreen triggers for autoplay transition

**Known Issue:** Since iframe blocks access to video events, we can't detect `ended` event
**Workaround:** The periodic polling (every 2 seconds) should still detect the src change


### 5. Regular Series (Non-iframe Video Player)

**URL:** https://hianime.to/watch/campfire-cooking-in-another-world-with-my-absurd-skill-season-2-19928?ep=147781

**Test Steps:**
1. Navigate to regular series episode
2. Check console for:
   - [ ] `[HiAnime AutoFS] Found video element:` (not iframe)
   - [ ] `[HiAnime AutoFS] Player type: VIDEO`

**Expected Result:** Falls back to video element detection for non-iframe players


### 6. Toggle Settings Test

**Test Steps:**
1. Click extension icon to open popup
2. Turn OFF "Auto-fullscreen on manual episode selection"
3. Manually switch episodes
   - [ ] Fullscreen should NOT trigger
4. Turn ON "Auto-fullscreen on manual episode selection"
5. Manually switch episodes
   - [ ] Fullscreen SHOULD trigger
6. Repeat for "Auto-fullscreen on autoplay"

**Expected Result:** Toggles correctly control fullscreen behavior


### 7. Multi-Monitor Support

**Test Steps:**
1. Move Firefox window to secondary monitor
2. Switch episodes while in fullscreen
3. Check that fullscreen remains on the same monitor

**Expected Result:** Fullscreen persists on the correct monitor


## Known Limitations

### Iframe Video Events
- Cannot detect `play`, `ended`, `loadedmetadata` events inside iframe
- These events are blocked by same-origin policy
- **Workaround:** Polling every 2 seconds detects src changes
- **Impact:** Autoplay detection relies on polling, not instant event detection

### Server Switching Detection
- Server switching (HD-1 → HD-2) changes iframe src
- Extension treats this as a "manual" episode change
- This is correct behavior - user manually clicked a server button

### Potential Issues to Watch For

1. **False Positives:**
   - Ads that change iframe src might trigger fullscreen
   - Check if HiAnime uses same iframe for ads

2. **Missing Detection:**
   - If iframe src is set via JavaScript object (not attribute), MutationObserver won't detect it
   - The 2-second polling should catch it as backup

3. **Performance:**
   - MutationObserver + 2-second polling might be redundant
   - Monitor for excessive CPU usage


## Debug Mode

Debug mode is currently ENABLED (CONFIG.DEBUG_MODE = true)

To disable for production:
1. Open content.js
2. Change line 9: `DEBUG_MODE: false`
3. Reload extension

All `[HiAnime AutoFS]` logs will be hidden from users.


## Console Log Reference

**Good logs to see:**
- `Content script loaded` - Extension initialized
- `Found iframe player` or `Found video element` - Player detected
- `Monitoring iframe for src changes` - Iframe observer active
- `Iframe src attribute changed` - Server/episode switch detected
- `Triggering fullscreen for manual/autoplay episode` - Fullscreen triggered

**Warning signs:**
- `No player found yet` - Player not detected (might load later)
- `Could not find video player or fullscreen button` - Fullscreen failed
- `Fullscreen request failed:` - Browser blocked fullscreen


## Test Matrix

| Scenario | Iframe | Video | Manual | Autoplay | Result |
|----------|--------|-------|--------|----------|--------|
| Movie episode 1→2 | ✓ | | ✓ | | Should work |
| Movie autoplay | ✓ | | | ✓ | Should work (polling) |
| Movie HD-1→HD-2 | ✓ | | ✓ | | Should work |
| Series episode 1→2 | | ✓ | ✓ | | Should work |
| Series autoplay | | ✓ | | ✓ | Should work |
