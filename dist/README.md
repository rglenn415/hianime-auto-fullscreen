# HiAnime Auto Fullscreen Extension

A Firefox extension that automatically fullscreens episodes on HiAnime with separate controls for manual and autoplay episodes.

## ✨ Features

- 🎬 Auto-fullscreen when manually selecting episodes
- ⏭️ Auto-fullscreen during autoplay transitions
- 🎛️ Independent toggle for each behavior
- 🖥️ Multi-monitor support
- 📊 Debug logging for troubleshooting

## 📦 Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to this directory and select `manifest.json`

## ⚙️ Settings

Click the extension icon to access two independent toggles:

### Manual Episodes
Auto-fullscreen when you click/select a new episode

### Autoplay Episodes
Auto-fullscreen when autoplay transitions to the next episode

**See [SETTINGS-GUIDE.md](SETTINGS-GUIDE.md) for detailed configuration options.**

## 🚀 How It Works

The extension monitors for:
- Video source changes (when a new episode loads)
- Video `ended` events (to detect autoplay)
- Video play events
- URL changes (for single-page navigation)
- DOM mutations (for dynamically loaded video players)

When a new episode is detected, it determines if it's a manual selection or autoplay, then triggers fullscreen based on your settings.

## Debugging & Event Analysis

### Built-in Debug Mode

The extension has `debugMode` enabled by default in [content.js](content.js). Check the browser console to see:
- When video elements are detected
- When video sources change
- When play events fire
- When fullscreen is triggered

### How to Analyze Events on HiAnime

To understand what events fire when a new episode starts, use these browser DevTools techniques:

#### 1. **Monitor All Events on the Video Element**

Open the browser console on HiAnime and run:

```javascript
// Find the video element
const video = document.querySelector('video');

// List of common video events to monitor
const events = [
  'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 'stalled',
  'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing',
  'waiting', 'seeking', 'seeked', 'ended', 'durationchange', 'timeupdate',
  'play', 'pause', 'ratechange', 'resize', 'volumechange'
];

events.forEach(event => {
  video.addEventListener(event, (e) => {
    console.log(`[VIDEO EVENT] ${event}`, e);
  });
});

// Monitor src changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
      console.log('[SRC CHANGED]', video.src);
    }
  });
});

observer.observe(video, { attributes: true });
```

#### 2. **Monitor DOM Changes**

```javascript
// Monitor when new video elements are added
const bodyObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.tagName === 'VIDEO') {
        console.log('[NEW VIDEO ELEMENT]', node);
      }
    });
  });
});

bodyObserver.observe(document.body, { childList: true, subtree: true });
```

#### 3. **Monitor URL Changes (for SPAs)**

```javascript
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    console.log('[URL CHANGED]', lastUrl, '->', url);
    lastUrl = url;
  }
}).observe(document, { subtree: true, childList: true });
```

#### 4. **Use Browser DevTools Event Listeners Panel**

1. Open DevTools (F12)
2. Go to the "Inspector" tab
3. Select the video element or player container
4. Look at the "Event Listeners" panel on the right
5. This shows all events attached to the element

#### 5. **Monitor Network Requests**

1. Open DevTools Network tab
2. Filter by "Media" or "XHR"
3. Click "Next Episode" and watch what requests fire
4. Look for patterns like `.m3u8`, `.mp4`, or API calls

#### 6. **Check Player-Specific Events**

Many video players (like Plyr, Video.js) have custom events:

```javascript
// For Plyr
const player = document.querySelector('.plyr');
if (player && player.plyr) {
  player.plyr.on('ready', () => console.log('[PLYR] Ready'));
  player.plyr.on('play', () => console.log('[PLYR] Play'));
  player.plyr.on('loadstart', () => console.log('[PLYR] Load Start'));
}

// For Video.js
const vjsPlayer = videojs.players[Object.keys(videojs.players)[0]];
if (vjsPlayer) {
  vjsPlayer.on('loadstart', () => console.log('[VJS] Load Start'));
  vjsPlayer.on('play', () => console.log('[VJS] Play'));
}
```

### What to Look For

When analyzing events for episode changes, look for:

1. **Video `src` changes** - Most reliable indicator
2. **`loadstart` event** - Fires when new media starts loading
3. **`loadedmetadata` event** - Fires when video metadata loads
4. **URL changes** - If HiAnime uses URL routing for episodes
5. **Network requests** - New `.m3u8` or `.mp4` requests
6. **Player API events** - Custom events from the video player library

## Customization

### Adjust Delay Before Fullscreen

In [content.js](content.js), modify the timeout values:

```javascript
setTimeout(() => {
  triggerFullscreen();
}, 1000); // Change this value (milliseconds)
```

### Add Custom Selectors

If the extension doesn't detect the video player, add selectors in [content.js](content.js):

```javascript
const selectors = [
  'video',
  '#player video',
  '.video-player video',
  'your-custom-selector' // Add here
];
```

### Disable Debug Logs

In [content.js](content.js), set:

```javascript
let debugMode = false;
```

## Toggling the Extension

Click the extension icon in the toolbar to enable/disable auto-fullscreen without removing the extension.

## Troubleshooting

1. **Fullscreen doesn't trigger**: Check console logs to see if video element is detected
2. **Wrong element goes fullscreen**: Update fullscreen button selectors in [content.js](content.js)
3. **Triggers too early/late**: Adjust timeout delays
4. **Doesn't work on specific pages**: Check if URL matches in [manifest.json](manifest.json)

## License

Free to use and modify.
