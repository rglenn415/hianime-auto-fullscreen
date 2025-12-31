# HiAnime Autoplay Monitoring Guide

This guide will help you analyze what happens during autoplay so we can improve the extension.

## Method 1: Using the Monitor Script (Recommended)

### Setup

1. Open HiAnime in Firefox
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Open the [monitor-autoplay.js](monitor-autoplay.js) file in a text editor
5. Copy the entire contents
6. Paste into the console and press Enter

### What You'll See

The script will log color-coded events:
- 🟢 **GREEN (VIDEO)** - Video element events (play, pause, ended, source changes)
- 🔵 **BLUE (DOM)** - DOM changes (new elements added)
- 🟠 **ORANGE (URL)** - URL changes
- 🟣 **PURPLE (NETWORK)** - Network requests for video files
- 🔴 **RED (PLAYER)** - Video player library events
- 🔷 **CYAN (FULLSCREEN)** - Fullscreen state changes

### Testing Autoplay

1. **Start playing an episode**
2. **Skip to near the end** (or wait for it to finish)
3. **Let autoplay trigger** the next episode
4. **Watch the console** - you'll see exactly what events fire and in what order

### Important Events to Watch For

Look for these patterns when autoplay happens:

1. **"SOURCE CHANGED"** - This is the most reliable signal
2. **"ended" event** - When current episode finishes
3. **"loadstart" event** - When next episode starts loading
4. **URL changes** - If the page URL changes
5. **Network requests** - New video file being fetched

### Saving the Results

After testing, run these commands in the console:

```javascript
// See a summary of all events
printEventSummary()

// Download the full event log
exportEventLog()

// View specific events
getEventLog().filter(e => e.category === 'VIDEO')
```

## Method 2: Quick Manual Testing

If you prefer a simpler approach, just open the console (F12) and paste this one-liner:

```javascript
// Monitor video events
var v = document.querySelector('video');
['ended', 'loadstart', 'play', 'playing', 'loadedmetadata'].forEach(e =>
  v.addEventListener(e, () => console.log(`[${new Date().toLocaleTimeString()}] ${e} - src: ${v.currentSrc?.split('/').pop()}`))
);

// Monitor src changes
var lastSrc = v.currentSrc;
setInterval(() => {
  if (v.currentSrc !== lastSrc) {
    console.log(`🔥 SRC CHANGED from ${lastSrc?.split('/').pop()} to ${v.currentSrc?.split('/').pop()}`);
    lastSrc = v.currentSrc;
  }
}, 100);

console.log('Monitoring started! Play a video and watch the console.');
```

## Method 3: Using Browser DevTools Event Listeners

1. Open DevTools (F12)
2. Go to **Inspector** tab (or **Elements** in Chrome)
3. Select the `<video>` element
4. Look at the **Event Listeners** panel on the right
5. See what events are attached and by which scripts

## What to Look For

After running the autoplay test, share these findings:

### Critical Questions

1. **What event fires FIRST when autoplay starts?**
   - Is it `ended` on the old video?
   - Is it `loadstart` on the new video?
   - Is it a URL change?

2. **Does the video `src` attribute change?**
   - Does the entire `<video>` element get replaced?
   - Or does just the `src` attribute update?

3. **What's the timing?**
   - How much delay between `ended` and the new video loading?
   - How much time between `loadstart` and `play`?

4. **Does the URL change?**
   - Does the page URL update when autoplay happens?
   - Is it a full page navigation or single-page app (SPA) style?

5. **Are there any network requests?**
   - What API calls are made?
   - Are new `.m3u8` or `.mp4` files requested?

## Expected Output Example

Here's what the log might look like during autoplay:

```
[10.52s] [VIDEO] Event: ended
  currentTime: 1420.5, duration: 1420.5, ended: true

[10.53s] [URL] 🌐 URL CHANGED 🌐
  from: /watch/anime-123?ep=456
  to: /watch/anime-123?ep=457

[10.75s] [NETWORK] XHR: GET request
  url: /ajax/episode/sources?id=457

[11.20s] [VIDEO] 🔥 SOURCE CHANGED 🔥
  from: https://cdn.example.com/ep456.m3u8
  to: https://cdn.example.com/ep457.m3u8

[11.25s] [VIDEO] Event: loadstart
  currentTime: 0, duration: NaN

[11.80s] [VIDEO] Event: loadedmetadata
  currentTime: 0, duration: 1380.2

[12.10s] [VIDEO] Event: play
  currentTime: 0, paused: false

[12.15s] [VIDEO] Event: playing
  currentTime: 0.5, paused: false
```

## Next Steps

Once you've captured the event log:

1. **Run `exportEventLog()`** to download the full log
2. **Share the findings** - tell me what events you saw and in what order
3. **Note the timing** - how long between events
4. **Check for patterns** - does it happen the same way every time?

With this information, we can update the extension to perfectly detect and handle autoplay!

## Troubleshooting

**No events showing?**
- Make sure you're on a HiAnime video page
- Try refreshing and running the script again
- Check that the video element exists: `console.log(document.querySelector('video'))`

**Too many events?**
- The script filters out `timeupdate` and `progress` events by default
- If you want to see them, edit the script and remove the filter

**Script errors?**
- Make sure you copied the entire script
- Try in a fresh browser tab
- Check the console for error messages
