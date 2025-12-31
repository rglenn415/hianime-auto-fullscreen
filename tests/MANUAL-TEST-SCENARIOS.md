# Manual Test Scenarios for HiAnime Auto Fullscreen Extension

This document contains comprehensive manual test scenarios to verify the extension works correctly.

## Test Environment Setup

### Prerequisites
- Firefox browser
- Extension loaded in `about:debugging`
- Access to HiAnime website
- (Optional) Second monitor for multi-monitor tests

### Before Each Test
1. Open Firefox DevTools (F12)
2. Go to Console tab
3. Verify extension is loaded: Look for `[HiAnime AutoFS] Content script loaded`
4. Clear console for clean test output

---

## Test Suite 1: Basic Functionality

### Test 1.1: Extension Loads Successfully
**Steps:**
1. Navigate to HiAnime video page
2. Open console (F12)

**Expected:**
- Console shows: `[HiAnime AutoFS] Content script loaded`
- Console shows: `[HiAnime AutoFS] Initializing HiAnime Auto Fullscreen`
- Console shows: `[HiAnime AutoFS] Found video element: video`

**Pass Criteria:** All initialization messages appear

---

### Test 1.2: Manual Episode Selection Triggers Fullscreen
**Steps:**
1. Go to HiAnime episode page
2. Click play on an episode
3. Wait for video to start

**Expected:**
- Video goes fullscreen automatically after ~1 second
- Console shows: `[HiAnime AutoFS] Attempting to enter fullscreen mode`
- Console shows: `[HiAnime AutoFS] Clicking fullscreen button` OR `Using native fullscreen API`

**Pass Criteria:** Video enters fullscreen within 2 seconds

---

### Test 1.3: Toggle Manual Episode Setting
**Steps:**
1. Click extension icon in toolbar
2. Turn OFF "Manual Episodes" toggle
3. Click a new episode
4. Turn ON "Manual Episodes" toggle
5. Click another episode

**Expected:**
- When OFF: Video does not auto-fullscreen when clicked
- Console shows: `[HiAnime AutoFS] Auto-fullscreen disabled for manual episodes`
- When ON: Video auto-fullscreens when clicked
- Console shows: `[HiAnime AutoFS] Triggering fullscreen for manual episode`

**Pass Criteria:** Manual episode toggle works correctly

---

### Test 1.4: Toggle Autoplay Episode Setting
**Steps:**
1. Click extension icon in toolbar
2. Turn OFF "Autoplay Episodes" toggle
3. Let an episode end and autoplay to next
4. Turn ON "Autoplay Episodes" toggle
5. Let another episode end and autoplay

**Expected:**
- When OFF: Autoplay doesn't trigger fullscreen
- Console shows: `[HiAnime AutoFS] Auto-fullscreen disabled for autoplay episodes`
- When ON: Autoplay triggers fullscreen
- Console shows: `[HiAnime AutoFS] Triggering fullscreen for autoplay episode`

**Pass Criteria:** Autoplay episode toggle works correctly

---

## Test Suite 2: Autoplay Functionality

### Test 2.1: Autoplay to Next Episode (Basic)
**Steps:**
1. Start playing an episode
2. Skip to near the end (use video controls)
3. Let episode finish
4. Wait for autoplay to next episode

**Expected:**
- Console shows: `[HiAnime AutoFS] Video ended - autoplay may trigger soon`
- Console shows: `[HiAnime AutoFS] Video source changed`
- Next episode goes fullscreen automatically

**Pass Criteria:** Fullscreen activates when next episode starts

---

### Test 2.2: Autoplay While Already in Fullscreen
**Steps:**
1. Manually enter fullscreen (click fullscreen button)
2. Wait for episode to end
3. Let autoplay trigger next episode

**Expected:**
- Console shows: `[HiAnime AutoFS] Video ended - autoplay may trigger soon`
- Console shows: `[HiAnime AutoFS] Already in fullscreen mode - maintaining fullscreen state`
- Fullscreen is maintained (does NOT exit and re-enter)
- Smooth transition to next episode

**Pass Criteria:** Stays in fullscreen, no flicker or exit/re-enter

---

### Test 2.3: Multiple Episodes Autoplay
**Steps:**
1. Start episode
2. Let it autoplay to episode 2
3. Let episode 2 autoplay to episode 3
4. Let episode 3 autoplay to episode 4

**Expected:**
- All episodes auto-fullscreen
- Console shows source changes for each transition
- Fullscreen maintained throughout all episodes

**Pass Criteria:** Fullscreen works for 3+ consecutive episodes

---

## Test Suite 3: Fullscreen State Management

### Test 3.1: Exit Fullscreen Mid-Episode
**Steps:**
1. Start episode with auto-fullscreen
2. Press ESC to exit fullscreen
3. Continue watching in normal mode
4. Wait for next episode autoplay

**Expected:**
- Console shows: `[HiAnime AutoFS] Fullscreen state changed: EXITED`
- Console shows: `[HiAnime AutoFS] Fullscreen exited - auto-fullscreen will trigger on next episode`
- Next episode auto-fullscreens again

**Pass Criteria:** Extension resets and triggers fullscreen on next episode

---

### Test 3.2: Manual Fullscreen Toggle
**Steps:**
1. Start episode without auto-fullscreen (both settings off)
2. Manually click fullscreen button
3. Enable autoplay setting
4. Let episode end and autoplay

**Expected:**
- Console tracks fullscreen state changes
- Autoplay maintains fullscreen
- No duplicate fullscreen attempts

**Pass Criteria:** Extension respects manual fullscreen state

---

### Test 3.3: Setting Combinations
**Steps:**
Test all four combinations:

**A) Both ON (Default)**
1. Manual Episodes: ON, Autoplay Episodes: ON
2. Click episode → Should fullscreen
3. Let autoplay → Should stay fullscreen

**B) Manual ON, Autoplay OFF**
1. Manual Episodes: ON, Autoplay Episodes: OFF
2. Click episode → Should fullscreen
3. Let autoplay → Should exit fullscreen

**C) Manual OFF, Autoplay ON**
1. Manual Episodes: OFF, Autoplay Episodes: ON
2. Click episode → Should NOT fullscreen
3. Let autoplay → Should fullscreen

**D) Both OFF**
1. Manual Episodes: OFF, Autoplay Episodes: OFF
2. Click episode → Should NOT fullscreen
3. Let autoplay → Should NOT fullscreen

**Expected:**
- Console logs show correct transition type (manual vs autoplay)
- Each combination behaves as described above

**Pass Criteria:** All four combinations work correctly

---

### Test 3.4: Fullscreen Before Video Loads
**Steps:**
1. Navigate to episode page
2. Immediately click fullscreen before video starts
3. Let video load and play

**Expected:**
- Console shows: `[HiAnime AutoFS] Already in fullscreen mode`
- Extension doesn't try to trigger fullscreen again
- Video plays normally in fullscreen

**Pass Criteria:** No duplicate fullscreen attempts

---

## Test Suite 4: Multi-Monitor Tests

### Test 4.1: Browser on Primary Monitor
**Prerequisites:** Multi-monitor setup

**Steps:**
1. Move Firefox to primary monitor
2. Start playing episode
3. Verify fullscreen activates on primary monitor

**Expected:**
- Fullscreen activates on primary monitor
- Console shows screen info (if using monitor script)

**Pass Criteria:** Fullscreen on correct monitor

---

### Test 4.2: Browser on Secondary Monitor
**Prerequisites:** Multi-monitor setup

**Steps:**
1. Move Firefox to secondary monitor
2. Start playing episode
3. Verify fullscreen activates on secondary monitor

**Expected:**
- Fullscreen activates on secondary monitor
- Autoplay maintains fullscreen on same monitor

**Pass Criteria:** Fullscreen stays on secondary monitor

---

### Test 4.3: Move Browser Between Episodes
**Prerequisites:** Multi-monitor setup

**Steps:**
1. Start episode on Monitor 1
2. Exit fullscreen (ESC)
3. Move browser window to Monitor 2
4. Let autoplay trigger next episode

**Expected:**
- Next episode fullscreens on Monitor 2
- Fullscreen follows browser window location

**Pass Criteria:** Fullscreen activates on current monitor

---

## Test Suite 5: Edge Cases

### Test 5.1: Network Interruption
**Steps:**
1. Start episode
2. Pause video
3. Disable network briefly
4. Re-enable network
5. Resume playback

**Expected:**
- Extension continues to work
- Next episode still auto-fullscreens
- No errors in console

**Pass Criteria:** Extension recovers gracefully

---

### Test 5.2: Page Refresh During Playback
**Steps:**
1. Start episode in fullscreen
2. Refresh page (F5)
3. Video reloads

**Expected:**
- Extension reinitializes
- Console shows initialization messages
- Auto-fullscreen works after refresh

**Pass Criteria:** Extension works after page refresh

---

### Test 5.3: Back/Forward Navigation
**Steps:**
1. Play episode 1
2. Navigate to episode 2 (browser back button)
3. Navigate forward again

**Expected:**
- Extension handles URL changes
- Console shows: `[HiAnime AutoFS] URL changed`
- Auto-fullscreen works after navigation

**Pass Criteria:** Extension handles browser navigation

---

### Test 5.4: Very Short Video
**Steps:**
1. Find a short video (< 30 seconds) or skip to last 10 seconds
2. Let it autoplay

**Expected:**
- Extension detects end quickly
- Autoplay happens normally
- Fullscreen triggers correctly

**Pass Criteria:** Works with short videos

---

### Test 5.5: Rapid Episode Changes
**Steps:**
1. Start episode
2. Immediately click next episode before current one loads
3. Repeat 3-4 times rapidly

**Expected:**
- Extension doesn't crash
- Final episode loads and fullscreens
- Console may show multiple source changes

**Pass Criteria:** Extension handles rapid changes

---

## Test Suite 6: Browser Compatibility

### Test 6.1: Firefox (Standard)
**Steps:**
1. Test all basic scenarios in Firefox
2. Check console for warnings/errors

**Expected:**
- All tests pass
- No console errors
- Fullscreen API works

**Pass Criteria:** Full functionality

---

### Test 6.2: Firefox Private Window
**Steps:**
1. Open private window
2. Load extension (if available in private mode)
3. Test basic autoplay

**Expected:**
- Extension works in private mode
- Storage settings persist in session

**Pass Criteria:** Works in private browsing

---

## Test Suite 7: Performance

### Test 7.1: CPU/Memory Usage
**Steps:**
1. Open browser Task Manager (Shift+Esc)
2. Start playing episodes
3. Let 5+ episodes autoplay
4. Monitor CPU and memory

**Expected:**
- CPU usage remains normal
- Memory doesn't continuously increase
- No memory leaks

**Pass Criteria:** Resource usage is reasonable

---

### Test 7.2: Console Log Volume
**Steps:**
1. Play 3 episodes
2. Check console message count

**Expected:**
- Reasonable number of log messages
- No spam or infinite loops
- Debug mode can be disabled

**Pass Criteria:** Logging is not excessive

---

## Test Suite 8: Integration Tests

### Test 8.1: With Ad Blocker
**Prerequisites:** Ad blocking extension installed

**Steps:**
1. Enable ad blocker
2. Test autoplay functionality

**Expected:**
- Extension works alongside ad blocker
- No conflicts or errors

**Pass Criteria:** Compatible with ad blockers

---

### Test 8.2: With Other Video Extensions
**Prerequisites:** Other video-related extensions

**Steps:**
1. Install another video extension (volume booster, speed controller, etc.)
2. Test autoplay

**Expected:**
- Extensions don't conflict
- Both work correctly

**Pass Criteria:** No extension conflicts

---

## Test Suite 9: Error Handling

### Test 9.1: Video Element Not Found
**Steps:**
1. Navigate to HiAnime page without video
2. Check console

**Expected:**
- Console shows: `[HiAnime AutoFS] No video element found initially`
- No errors thrown
- Extension waits for video to appear

**Pass Criteria:** Graceful handling of missing video

---

### Test 9.2: Fullscreen Permission Denied
**Steps:**
1. (Manually deny fullscreen permission if possible)
2. Try to trigger fullscreen

**Expected:**
- Console shows error message
- Extension doesn't crash
- Can retry on next episode

**Pass Criteria:** Handles denied permissions

---

## Test Result Template

```
Test ID: [e.g., 2.2]
Test Name: [e.g., Autoplay While Already in Fullscreen]
Date: [YYYY-MM-DD]
Tester: [Name]
Browser: [Firefox version]
OS: [Windows/Mac/Linux + version]

Result: [PASS/FAIL]

Notes:
[Any observations, issues, or comments]

Console Output:
[Relevant console messages]
```

---

## Success Criteria

Extension is considered fully functional when:
- ✅ All Test Suite 1 (Basic) tests pass
- ✅ All Test Suite 2 (Autoplay) tests pass
- ✅ Test Suite 3.1 and 3.2 pass
- ✅ At least one multi-monitor test passes (if applicable)
- ✅ No critical errors in any test
- ✅ Performance tests show acceptable resource usage

---

## Known Issues Template

If you find issues during testing, document them:

```
Issue #: [Number]
Test: [Which test revealed it]
Severity: [Critical/High/Medium/Low]
Description: [What went wrong]
Steps to Reproduce:
1.
2.
3.

Expected: [What should happen]
Actual: [What actually happened]
Console Output: [Error messages]
Workaround: [If any]
```

---

## Automated Testing

For automated tests, see:
- [tests/extension.test.js](extension.test.js) - Jest unit tests
- Run with: `npm test` (after setup)

For monitoring during manual tests:
- Use [monitor-autoplay.js](../monitor-autoplay.js) in browser console
- Provides detailed event logging and analysis
