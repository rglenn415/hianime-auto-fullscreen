# Permissions Explanation

This document explains why each permission is required and how it's used.

## Permissions Requested

### 1. `storage`

**Why Required:** To save your preferences between browser sessions

**What It Does:**
- Stores two boolean values:
  - `enableManualEpisode` - Whether to auto-fullscreen manually selected episodes
  - `enableAutoplayEpisode` - Whether to auto-fullscreen autoplay episodes

**What It Does NOT Do:**
- ❌ Does not access other extensions' storage
- ❌ Does not store browsing history
- ❌ Does not store personal information
- ❌ Does not sync to external servers

**Data Scope:**
- Only 2 settings stored
- Total size: < 100 bytes
- Storage location: Local browser storage only
- Accessible by: This extension only

**Example Data:**
```json
{
  "enableManualEpisode": true,
  "enableAutoplayEpisode": true
}
```

**Could We Work Without It?**
No - without storage, your settings would reset every time you close Firefox.

---

### 2. `activeTab`

**Why Required:** To access HiAnime pages and interact with the video player

**What It Does:**
- Detects video elements on HiAnime pages
- Monitors video source changes
- Triggers fullscreen API
- Attaches event listeners to video players

**What It Does NOT Do:**
- ❌ Does not access other tabs
- ❌ Does not track browsing on other sites
- ❌ Does not inject ads or modify content
- ❌ Does not access data from other websites

**Scope Limitation:**
- **Only works on:** `*.hianime.to/*`
- **Only when:** Content script is injected (when you visit HiAnime)
- **Cannot access:** Any other websites

**Technical Details:**
```javascript
// Manifest.json content_scripts restriction:
"matches": ["*://*.hianime.to/*", "*://hianime.to/*"]
```

This means the extension **only** runs on HiAnime pages, not anywhere else.

**Could We Work Without It?**
No - we need access to the page to detect video elements and trigger fullscreen.

---

## Permissions We DON'T Request

For transparency, here are permissions we **could** ask for but **don't need:**

### `tabs`
**Not needed** - We don't need to access browser tabs

### `history`
**Not needed** - We don't need browsing history

### `cookies`
**Not needed** - We don't use cookies

### `webRequest`
**Not needed** - We don't intercept network requests

### `<all_urls>`
**Not needed** - We only work on HiAnime

### `notifications`
**Not needed** - We don't show notifications

### `clipboardWrite`
**Not needed** - We don't access clipboard

### `geolocation`
**Not needed** - We don't need location

### `unlimitedStorage`
**Not needed** - We only store 2 boolean values

---

## Permission Audit

| Permission | Required? | Justification | Alternative? |
|------------|-----------|---------------|--------------|
| `storage` | ✅ Yes | Save user preferences | ❌ No - settings would reset |
| `activeTab` | ✅ Yes | Access HiAnime video player | ❌ No - can't detect videos without it |

**Total Permissions:** 2 (minimal)

---

## Data Flow Diagram

```
User toggles setting in popup
        ↓
browser.storage.local.set()
        ↓
Settings saved to local storage
        ↓
Content script reads settings
        ↓
Applies to HiAnime page behavior
```

**No external servers involved at any step**

---

## Privacy Impact Assessment

### Storage Permission

**Risk Level:** Low

**Mitigations:**
- Only stores user preferences
- No sensitive data
- Never transmitted
- User can clear anytime

**User Control:**
- View settings: Click extension icon
- Modify settings: Toggle switches
- Delete data: Uninstall extension

---

### ActiveTab Permission

**Risk Level:** Low

**Mitigations:**
- Restricted to HiAnime.to only
- No data collection
- No modifications beyond fullscreen
- Open source for verification

**User Control:**
- Extension only runs on HiAnime
- Can be disabled at any time
- Code can be audited

---

## Comparison with Similar Extensions

Many video extensions request far more permissions:

**Typical Video Extension:**
- `tabs` (our extension: ❌)
- `<all_urls>` (our extension: ❌)
- `webRequest` (our extension: ❌)
- `cookies` (our extension: ❌)
- `history` (our extension: ❌)

**Our Extension:**
- `storage` ✅ (minimal)
- `activeTab` ✅ (restricted)

**We request 80% fewer permissions than typical video extensions**

---

## Firefox Permissions API

We use the WebExtensions API responsibly:

### Storage API Usage
```javascript
// Read
browser.storage.local.get(['enableManualEpisode', 'enableAutoplayEpisode'])

// Write
browser.storage.local.set({ enableManualEpisode: true })
```

**That's it.** No other storage methods used.

### ActiveTab API Usage
```javascript
// Only these operations on HiAnime:
- document.querySelector('video')
- video.addEventListener(...)
- video.requestFullscreen()
```

**That's it.** No content modification, no data extraction.

---

## Transparency Commitments

1. **Open Source:** All code is available for review
2. **No Hidden Features:** What you see is what you get
3. **No Future Scope Creep:** We won't request additional permissions later without clear justification
4. **Minimal Permissions:** We will never request more than absolutely necessary
5. **User First:** Settings are yours, stored locally, deleted when you uninstall

---

## Questions & Answers

### Q: Why not use `unlimitedStorage`?
**A:** We only store 2 boolean values (~50 bytes). The default quota is more than enough.

### Q: Why not request `<all_urls>` for convenience?
**A:** We only need HiAnime access. Requesting more is unnecessary and privacy-invasive.

### Q: Could you reduce permissions further?
**A:** No - these 2 permissions are the absolute minimum for the extension to function.

### Q: What if HiAnime changes domains?
**A:** We'd update the manifest to match the new domain, but still only request that specific site.

### Q: Can I verify the permissions?
**A:** Yes! Check `manifest.json` in the source code:
```json
"permissions": [
  "activeTab",
  "storage"
]
```

---

## Regulatory Compliance

### GDPR (Europe)
- ✅ Minimal data collection
- ✅ User control over data
- ✅ No data sharing
- ✅ Easy data deletion

### CCPA (California)
- ✅ No personal information collected
- ✅ No sale of data
- ✅ Clear disclosure

### Firefox Add-on Policies
- ✅ Permissions justified
- ✅ Privacy policy provided
- ✅ No deceptive practices
- ✅ User data protected

---

## Security Considerations

### Storage Permission
- Data stored in browser's secure storage
- Not accessible by other extensions
- Not accessible by websites
- Encrypted by browser (if user has disk encryption)

### ActiveTab Permission
- Sandboxed content script
- Cannot access extension background page
- Cannot access other tabs
- Restricted by Content Security Policy

---

## Reporting Issues

If you notice:
- Unexpected permissions requested
- Suspicious data access
- Privacy concerns

Please report immediately:
- GitHub Issues: [Your Repository]
- Email: [Support Email]

We take privacy and security seriously and will respond promptly.

---

## Audit Trail

**Last Reviewed:** December 30, 2025
**Permissions Changed:** Never (initial release)
**Next Review:** Upon any code changes

---

**Summary:** We request only 2 permissions, both absolutely necessary, both with minimal privacy impact, and both clearly justified above.
