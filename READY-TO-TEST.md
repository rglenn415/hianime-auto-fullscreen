# Ready to Test - Quick Start Guide

## Current Status: Ready for Testing (Without Icons)

The extension is functionally complete and ready to test. Icons can be added later.

---

## ⚡ Quick Setup (5 Minutes)

### 1. Update Placeholders

**Update these 2 values in manifest.json:**

```json
// Change from:
"id": "hianime-autofullscreen@example.com"
// To (use your email):
"id": "hianime-autofullscreen@YOUREMAIL.com"

// Change from:
"homepage_url": "https://github.com/yourusername/hianime-auto-fullscreen"
// To (your actual GitHub or remove this line):
"homepage_url": "https://github.com/YOURUSERNAME/hianime-auto-fullscreen"
```

**Or remove homepage_url entirely if you don't have a repository yet:**
```json
{
  "manifest_version": 2,
  "name": "HiAnime Auto Fullscreen",
  "version": "1.0.0",
  "description": "Automatically fullscreens episodes on HiAnime with separate controls for manual and autoplay episodes",
  "author": "HiAnime Auto Fullscreen Contributors",

  "browser_specific_settings": {
    "gecko": {
      "id": "hianime-autofullscreen@YOUREMAIL.com",
      "strict_min_version": "57.0"
    }
  },
  ...
}
```

### 2. Load Extension in Firefox

```
1. Open Firefox
2. Type: about:debugging
3. Click: "This Firefox"
4. Click: "Load Temporary Add-on"
5. Navigate to: c:\Users\skate\hianime
6. Select: manifest.json
7. Click: Open
```

**Expected Result:** Extension loads without errors

---

## 🧪 Essential Tests (10 Minutes)

### Test 1: Extension Loads
- [ ] No errors in about:debugging
- [ ] Extension appears in list
- [ ] Extension icon appears in toolbar (will be generic without custom icon)

### Test 2: Popup Works
- [ ] Click extension icon
- [ ] Popup opens showing two toggles
- [ ] Both toggles default to ON
- [ ] Toggling works smoothly

### Test 3: Settings Persist
- [ ] Toggle one setting OFF
- [ ] Close popup
- [ ] Reopen popup
- [ ] Setting is still OFF ✓

### Test 4: Manual Episode Fullscreen
1. Go to HiAnime (e.g., the URL you shared earlier)
2. Ensure "Manual Episodes" toggle is ON
3. Click an episode
4. **Expected:** Video goes fullscreen after ~1 second

### Test 5: Autoplay Fullscreen
1. Ensure "Autoplay Episodes" toggle is ON
2. Play an episode
3. Skip to near the end
4. Let it autoplay to next episode
5. **Expected:** Next episode goes fullscreen automatically

### Test 6: Console Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Look for `[HiAnime AutoFS]` messages
4. **Expected:** Should see initialization messages

**Debug mode is OFF, but you should still see some logs**

---

## 🔍 Console Check

**Expected console output when extension loads:**
```
[HiAnime AutoFS] Content script loaded
[HiAnime AutoFS] Initializing HiAnime Auto Fullscreen
[HiAnime AutoFS] Auto-fullscreen settings - Manual: true Autoplay: true
```

**When playing episode:**
```
[HiAnime AutoFS] Found video element: video
[HiAnime AutoFS] Video play event detected
[HiAnime AutoFS] Video source changed: ...
[HiAnime AutoFS] Transition type: manual
[HiAnime AutoFS] Triggering fullscreen for manual episode
```

**If you see errors instead, something needs fixing**

---

## 🎯 Quick Test Checklist

### ✅ Basic Functionality
- [ ] Extension loads without errors
- [ ] Popup opens and shows settings
- [ ] Settings can be toggled
- [ ] Settings persist after closing popup

### ✅ Manual Episodes
- [ ] Clicking episode triggers fullscreen (toggle ON)
- [ ] Clicking episode doesn't trigger fullscreen (toggle OFF)

### ✅ Autoplay Episodes
- [ ] Autoplay triggers fullscreen (toggle ON)
- [ ] Autoplay doesn't trigger fullscreen (toggle OFF)

### ✅ No Errors
- [ ] No errors in browser console
- [ ] No errors in about:debugging
- [ ] Extension doesn't crash

**If all checked: Extension works! ✨**

---

## 🐛 Troubleshooting

### Extension Won't Load
**Error:** "There was an error during installation"
**Fix:**
- Check manifest.json syntax (use JSON validator)
- Ensure all files are in correct location
- Check browser console for specific error

### No Console Logs
**Issue:** Don't see `[HiAnime AutoFS]` messages
**Possible Causes:**
- Not on HiAnime website
- Extension not loaded
- Content script not injected

**Fix:**
- Verify you're on hianime.to
- Reload extension in about:debugging
- Refresh HiAnime page

### Fullscreen Doesn't Trigger
**Issue:** Video doesn't go fullscreen
**Debug:**
1. Open console (F12)
2. Look for errors
3. Check if video element is detected
4. Verify correct toggle is ON

**Common Causes:**
- Wrong toggle disabled
- HiAnime changed their player structure
- Selector doesn't match current player

**Fix:**
- Enable debug mode temporarily (set CONFIG.DEBUG_MODE = true)
- Check console for detailed logs
- Verify video element selector

### Settings Don't Save
**Issue:** Toggles reset when popup closes
**Debug:**
- Check console for storage errors
- Verify storage permission granted

**Fix:**
- Reload extension
- Check if Firefox has storage disabled
- Look for console errors about storage

---

## 🔧 Enable Debug Mode (If Needed)

If you need more detailed logging:

1. Open `content.js`
2. Find line 9: `DEBUG_MODE: false`
3. Change to: `DEBUG_MODE: true`
4. Reload extension in about:debugging
5. Refresh HiAnime page
6. **Much more detailed console logs will appear**

**Remember to set back to `false` before release!**

---

## 📊 Test Results Template

```
Date: [DATE]
Browser: Firefox [VERSION]
OS: Windows [VERSION]

✅ Extension loads
✅ Popup works
✅ Settings persist
✅ Manual episode fullscreen works
✅ Autoplay fullscreen works
✅ No console errors

Issues Found:
- [None / List any issues]

Notes:
- [Any observations]

Status: [PASS / FAIL / PARTIAL]
```

---

## 🚀 What to Test On HiAnime

### Minimum Test (5 minutes)
1. Load any episode
2. Verify it goes fullscreen
3. Let it autoplay to next
4. Verify it stays fullscreen

### Comprehensive Test (15 minutes)
1. **Both toggles ON:**
   - Click episode → fullscreen ✓
   - Autoplay → stays fullscreen ✓

2. **Manual ON, Autoplay OFF:**
   - Click episode → fullscreen ✓
   - Autoplay → exits fullscreen ✓

3. **Manual OFF, Autoplay ON:**
   - Click episode → no fullscreen ✓
   - Autoplay → goes fullscreen ✓

4. **Both OFF:**
   - Click episode → no fullscreen ✓
   - Autoplay → no fullscreen ✓

---

## ⚡ Fast Test Script

**Copy/paste this checklist:**

```
□ Updated extension ID in manifest.json
□ Loaded extension in about:debugging
□ Extension loads without errors
□ Clicked extension icon - popup opens
□ Both toggles visible and working
□ Went to HiAnime
□ Played episode - goes fullscreen
□ Toggled settings - they persist
□ No errors in console
□ Extension works as expected
```

---

## 📝 Next Steps After Testing

### If Everything Works:
1. ✅ Great! Extension is functional
2. Consider adding icons later
3. Can use as-is or submit to store
4. Start using it on HiAnime!

### If Issues Found:
1. Document the issue
2. Check console for errors
3. Enable debug mode
4. Review relevant code section
5. Fix and retest

### When Ready to Submit:
1. Review PRE-RELEASE-CHECKLIST.md
2. Create screenshots for store
3. Consider adding icons
4. Build XPI package
5. Submit to Firefox Add-ons

---

## 💡 Using Without Submission

**You can use this extension right now without submitting to the store!**

**As a temporary add-on:**
- Load via about:debugging each time Firefox starts
- Fully functional
- Perfect for personal use

**To make permanent (without store):**
1. Package as XPI
2. Disable signature verification (Developer Edition)
3. Or sign yourself via AMO

---

## 🎉 You're Ready!

The extension is production-quality code and ready to test. Icons are nice-to-have but not required for functionality.

**Start testing and enjoy auto-fullscreen on HiAnime!** 🎬

---

## Quick Reference

**Load Extension:**
`about:debugging` → This Firefox → Load Temporary Add-on → manifest.json

**Test URL:**
https://hianime.to/watch/[any-anime]

**Console:**
F12 → Console tab → Look for `[HiAnime AutoFS]`

**Reload Extension:**
about:debugging → Reload button next to extension

**Check Settings:**
Click extension icon → See both toggles

---

**Happy Testing!** 🚀
