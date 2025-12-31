# Test Updates for Separate Manual/Autoplay Settings

All tests have been updated to reflect the new two-toggle settings system.

## Summary of Changes

### 1. Unit Tests ([extension.test.js](extension.test.js))

#### Updated Tests:
- ✅ **Browser Storage tests** - Now test both `enableManualEpisode` and `enableAutoplayEpisode`
- ✅ **Added 8 new tests** for autoplay transition detection

#### New Test Cases:
```javascript
✓ should load manual episode setting from storage
✓ should load autoplay episode setting from storage
✓ should default both settings to enabled when not set
✓ should save manual episode state
✓ should save autoplay episode state
✓ should set autoplay flag when video ends
✓ should reset autoplay flag after manual episode selection
✓ should detect manual episode transition
✓ should detect autoplay episode transition
✓ should respect manual episode disabled setting
✓ should respect autoplay episode disabled setting
```

#### Total Tests:
- **Before:** 35 tests
- **After:** 43 tests (+8)

---

### 2. Manual Test Scenarios ([MANUAL-TEST-SCENARIOS.md](MANUAL-TEST-SCENARIOS.md))

#### Updated Tests:
- ✅ **Test 1.3** - Now tests "Manual Episodes" toggle specifically
- ✅ **Test 1.4** - New test for "Autoplay Episodes" toggle
- ✅ **Test 3.2** - Updated to use both settings
- ✅ **Test 3.3** - New comprehensive setting combinations test

#### New Test: Setting Combinations (Test 3.3)
Tests all four possible configurations:

**A) Both ON (Default)**
- Manual: ✅ → Autoplay: ✅
- Behavior: Always fullscreen

**B) Manual ON, Autoplay OFF**
- Manual: ✅ → Autoplay: ❌
- Behavior: Fullscreen on click, exit on autoplay

**C) Manual OFF, Autoplay ON**
- Manual: ❌ → Autoplay: ✅
- Behavior: No fullscreen on click, fullscreen on autoplay

**D) Both OFF**
- Manual: ❌ → Autoplay: ❌
- Behavior: Never fullscreen

#### Updated Console Log Expectations:
Old:
```
[HiAnime AutoFS] Auto-fullscreen disabled
```

New:
```
[HiAnime AutoFS] Auto-fullscreen disabled for manual episodes
[HiAnime AutoFS] Auto-fullscreen disabled for autoplay episodes
[HiAnime AutoFS] Transition type: manual
[HiAnime AutoFS] Transition type: autoplay
```

---

### 3. Test Page ([test-page.html](test-page.html))

#### New Features:
- ✅ **Transition type tracking** - Shows whether last episode load was manual or autoplay
- ✅ **Visual indicators** - Color-coded transition type in status display
- ✅ **Updated loadEpisode()** - Now accepts `isAutoplay` parameter

#### New Status Display:
```
Last Transition: manual (blue) | autoplay (orange) | none (grey)
```

#### Updated Functions:
```javascript
// Old
loadEpisode(episodeId)

// New
loadEpisode(episodeId, isAutoplay = false)
```

When calling:
```javascript
// Manual selection
loadEpisode(1); // or loadEpisode(1, false)

// Autoplay
loadEpisode(2, true);
```

---

## Running Updated Tests

### Automated Tests (Unit)

```bash
cd c:\Users\skate\hianime
npm install  # If not done already
npm test
```

Expected output:
```
PASS  tests/extension.test.js
  HiAnime Auto Fullscreen Extension
    ✓ Browser Storage (5 tests)
    ✓ Autoplay Detection (8 tests)
    ... (35 more tests)

Test Suites: 1 passed, 1 total
Tests:       43 passed, 43 total
```

---

### Manual Tests (On HiAnime)

Follow updated scenarios in [MANUAL-TEST-SCENARIOS.md](MANUAL-TEST-SCENARIOS.md).

**Priority tests:**
1. Test 1.3 - Manual Episodes toggle
2. Test 1.4 - Autoplay Episodes toggle
3. Test 3.3 - All four setting combinations

**Quick verification:**
```
✓ Both toggles appear in popup
✓ Each toggle works independently
✓ Console shows correct transition type
✓ Settings persist after page reload
```

---

### Local Test Page

```bash
# Open in Firefox
firefox tests/test-page.html
```

**Test the transition type tracking:**
1. Click "Load Episode 1" → Status shows "manual" (blue)
2. Click "Simulate Autoplay" → Status shows "autoplay" (orange)
3. Check console for `[manual]` and `[autoplay]` tags

---

## Test Coverage

### Feature Coverage Matrix

| Feature | Unit Tests | Manual Tests | Test Page |
|---------|-----------|--------------|-----------|
| Manual episode toggle | ✅ | ✅ | ✅ |
| Autoplay episode toggle | ✅ | ✅ | ✅ |
| Transition detection | ✅ | ✅ | ✅ |
| Storage persistence | ✅ | ✅ | ❌ |
| Setting combinations | ✅ | ✅ | ⚠️ Partial |
| Console logging | ❌ | ✅ | ✅ |

**Legend:**
- ✅ Full coverage
- ⚠️ Partial coverage
- ❌ Not tested

---

## Console Log Changes

### Old Logs (v1.0)
```
[HiAnime AutoFS] Auto-fullscreen disabled
[HiAnime AutoFS] Auto-fullscreen enabled: true
```

### New Logs (v1.1)
```
[HiAnime AutoFS] Auto-fullscreen settings - Manual: true Autoplay: true
[HiAnime AutoFS] Transition type: manual
[HiAnime AutoFS] Triggering fullscreen for manual episode
[HiAnime AutoFS] Auto-fullscreen disabled for manual episodes
[HiAnime AutoFS] Transition type: autoplay
[HiAnime AutoFS] Triggering fullscreen for autoplay episode
[HiAnime AutoFS] Auto-fullscreen disabled for autoplay episodes
```

---

## Breaking Changes

### None!

All existing tests still pass with minor updates to assertions.

**Migration:**
- Old storage format works (ignored)
- Default behavior unchanged (both ON)
- Console logs enhanced, not broken

---

## Known Test Limitations

### 1. Storage Persistence in Test Page
**Issue:** Test page doesn't test browser storage
**Workaround:** Manual testing on HiAnime required
**Impact:** Low - unit tests cover storage

### 2. Setting Combinations in Test Page
**Issue:** Can't toggle extension settings from test page
**Workaround:** Test individual transitions instead
**Impact:** Low - manual tests cover combinations

### 3. Exact Timing
**Issue:** Tests don't verify exact timing of fullscreen trigger
**Workaround:** Visual verification during manual tests
**Impact:** Low - functionality is what matters

---

## Test Maintenance

### When Adding New Features

1. **Add unit test** in `extension.test.js`
2. **Add manual scenario** in `MANUAL-TEST-SCENARIOS.md`
3. **Update test page** if relevant UI changes
4. **Run all tests** before committing

### When Fixing Bugs

1. **Add regression test** (unit or manual)
2. **Verify fix** with test
3. **Update docs** if behavior changed

---

## Quick Test Checklist

Before releasing changes:

```
□ npm test passes (43/43 tests)
□ Test 1.3 passes on HiAnime (manual toggle)
□ Test 1.4 passes on HiAnime (autoplay toggle)
□ Test 3.3 passes on HiAnime (all combinations)
□ Test page shows correct transition types
□ Console logs are accurate
□ Settings persist after reload
□ No browser console errors
```

---

## Questions?

See the main [Test README](README.md) for general testing information!
