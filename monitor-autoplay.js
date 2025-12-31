// HiAnime Autoplay Monitor Script
// Paste this into the browser console on HiAnime to monitor what happens during autoplay
// This will help identify the exact events and changes that occur

(function() {
  'use strict';

  console.clear();
  console.log('%c=== HiAnime Autoplay Monitor Started ===', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;');
  console.log('This script will monitor and log all relevant events.');
  console.log('Play a video and let it end (or skip to the end) to see autoplay behavior.\n');

  const eventLog = [];
  let monitoringStartTime = Date.now();

  function getTimestamp() {
    return `[${((Date.now() - monitoringStartTime) / 1000).toFixed(2)}s]`;
  }

  function logEvent(category, message, data = null) {
    const timestamp = getTimestamp();
    const logEntry = { timestamp, category, message, data, time: new Date().toISOString() };
    eventLog.push(logEntry);

    const colors = {
      'VIDEO': 'color: #4CAF50; font-weight: bold',
      'DOM': 'color: #2196F3; font-weight: bold',
      'URL': 'color: #FF9800; font-weight: bold',
      'NETWORK': 'color: #9C27B0; font-weight: bold',
      'PLAYER': 'color: #F44336; font-weight: bold',
      'FULLSCREEN': 'color: #00BCD4; font-weight: bold'
    };

    console.log(`%c${timestamp} [${category}]%c ${message}`, colors[category] || '', 'color: inherit', data || '');
  }

  // ========== VIDEO ELEMENT MONITORING ==========

  function findVideoElement() {
    const selectors = ['video', '#player video', '.video-player video', 'iframe video'];
    for (const sel of selectors) {
      const vid = document.querySelector(sel);
      if (vid) return vid;
    }
    return null;
  }

  function monitorVideoElement(video) {
    if (!video || video.hasAttribute('data-monitor-attached')) return;
    video.setAttribute('data-monitor-attached', 'true');

    logEvent('VIDEO', 'Video element found and being monitored', {
      src: video.src || video.currentSrc,
      tagName: video.tagName,
      id: video.id,
      className: video.className
    });

    // All video events
    const videoEvents = [
      'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 'stalled',
      'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing',
      'waiting', 'seeking', 'seeked', 'ended', 'durationchange', 'timeupdate',
      'play', 'pause', 'ratechange', 'resize', 'volumechange'
    ];

    videoEvents.forEach(eventName => {
      video.addEventListener(eventName, (e) => {
        // Skip timeupdate to reduce noise (comment this out if you want to see every timeupdate)
        if (eventName === 'timeupdate' || eventName === 'progress') return;

        logEvent('VIDEO', `Event: ${eventName}`, {
          currentTime: video.currentTime,
          duration: video.duration,
          src: video.src || video.currentSrc,
          readyState: video.readyState,
          networkState: video.networkState,
          paused: video.paused,
          ended: video.ended
        });
      });
    });

    // Monitor src changes
    let lastSrc = video.src || video.currentSrc;
    const srcObserver = new MutationObserver(() => {
      const currentSrc = video.src || video.currentSrc;
      if (currentSrc && currentSrc !== lastSrc) {
        logEvent('VIDEO', '🔥 SOURCE CHANGED 🔥', {
          from: lastSrc,
          to: currentSrc
        });
        lastSrc = currentSrc;
      }
    });

    srcObserver.observe(video, {
      attributes: true,
      attributeFilter: ['src']
    });

    // Monitor currentSrc changes via polling
    setInterval(() => {
      const currentSrc = video.src || video.currentSrc;
      if (currentSrc && currentSrc !== lastSrc) {
        logEvent('VIDEO', '🔥 CURRENT SRC CHANGED 🔥', {
          from: lastSrc,
          to: currentSrc
        });
        lastSrc = currentSrc;
      }
    }, 100);
  }

  // ========== DOM MUTATION MONITORING ==========

  const domObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      // Check for new video elements
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'VIDEO') {
            logEvent('DOM', 'New VIDEO element added to DOM', {
              id: node.id,
              className: node.className,
              src: node.src
            });
            monitorVideoElement(node);
          }

          // Check for video elements in added subtrees
          if (node.querySelectorAll) {
            const videos = node.querySelectorAll('video');
            videos.forEach(vid => {
              if (!vid.hasAttribute('data-monitor-attached')) {
                logEvent('DOM', 'New VIDEO element found in added subtree');
                monitorVideoElement(vid);
              }
            });
          }
        });
      }

      // Monitor attribute changes on body and main containers
      if (mutation.type === 'attributes' && mutation.target.id) {
        logEvent('DOM', `Attribute changed on #${mutation.target.id}`, {
          attribute: mutation.attributeName,
          value: mutation.target.getAttribute(mutation.attributeName)
        });
      }
    });
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-episode', 'data-id']
  });

  // ========== URL MONITORING ==========

  let lastUrl = location.href;
  setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      logEvent('URL', '🌐 URL CHANGED 🌐', {
        from: lastUrl,
        to: currentUrl
      });
      lastUrl = currentUrl;
    }
  }, 100);

  // Monitor history API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    logEvent('URL', 'history.pushState called', { args });
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    logEvent('URL', 'history.replaceState called', { args });
    return originalReplaceState.apply(this, args);
  };

  window.addEventListener('popstate', (e) => {
    logEvent('URL', 'popstate event', { state: e.state });
  });

  // ========== NETWORK MONITORING ==========

  // Monitor XHR requests
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._monitorUrl = url;
    this._monitorMethod = method;
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const url = this._monitorUrl;

    // Only log media-related or episode-related requests
    if (url && (url.includes('.m3u8') || url.includes('.mp4') ||
                url.includes('episode') || url.includes('source') ||
                url.includes('video') || url.includes('/ajax/'))) {
      logEvent('NETWORK', `XHR: ${this._monitorMethod} request`, { url });

      this.addEventListener('load', () => {
        logEvent('NETWORK', `XHR: Response received`, {
          url,
          status: this.status,
          responseSize: this.responseText?.length
        });
      });
    }

    return originalXHRSend.apply(this, args);
  };

  // Monitor Fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];

    if (url && (typeof url === 'string') &&
        (url.includes('.m3u8') || url.includes('.mp4') ||
         url.includes('episode') || url.includes('source') ||
         url.includes('video') || url.includes('/ajax/'))) {
      logEvent('NETWORK', 'Fetch request', { url });
    }

    return originalFetch.apply(this, args);
  };

  // ========== FULLSCREEN MONITORING ==========

  // Monitor screen and window info
  function getScreenInfo() {
    return {
      screenCount: window.screen.isExtended ? 'Multiple (Extended)' : 'Single',
      currentScreen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        orientation: window.screen.orientation?.type
      },
      window: {
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        screenX: window.screenX,
        screenY: window.screenY,
        screenLeft: window.screenLeft,
        screenTop: window.screenTop
      },
      fullscreenElement: document.fullscreenElement?.tagName || 'none',
      fullscreenEnabled: document.fullscreenEnabled
    };
  }

  document.addEventListener('fullscreenchange', () => {
    const screenInfo = getScreenInfo();
    logEvent('FULLSCREEN', 'Fullscreen state changed', {
      isFullscreen: !!document.fullscreenElement,
      element: document.fullscreenElement?.tagName,
      screenInfo
    });
  });

  ['webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'].forEach(event => {
    document.addEventListener(event, () => {
      const screenInfo = getScreenInfo();
      logEvent('FULLSCREEN', `${event} fired`, { screenInfo });
    });
  });

  // Monitor for window position/size changes (might indicate monitor switch)
  let lastScreenX = window.screenX;
  let lastScreenY = window.screenY;
  setInterval(() => {
    if (window.screenX !== lastScreenX || window.screenY !== lastScreenY) {
      logEvent('FULLSCREEN', 'Window position changed (possible monitor switch)', {
        from: { x: lastScreenX, y: lastScreenY },
        to: { x: window.screenX, y: window.screenY },
        screenInfo: getScreenInfo()
      });
      lastScreenX = window.screenX;
      lastScreenY = window.screenY;
    }
  }, 500);

  // ========== PLAYER LIBRARY DETECTION ==========

  setTimeout(() => {
    // Check for Plyr
    const plyrElement = document.querySelector('.plyr');
    if (plyrElement) {
      logEvent('PLAYER', 'Plyr player detected', { element: plyrElement });

      if (plyrElement.plyr) {
        const player = plyrElement.plyr;
        logEvent('PLAYER', 'Plyr API available', {
          duration: player.duration,
          currentTime: player.currentTime
        });

        // Monitor Plyr events
        ['ready', 'play', 'pause', 'ended', 'loadstart', 'loadeddata', 'canplay', 'playing'].forEach(event => {
          player.on(event, () => {
            logEvent('PLAYER', `Plyr event: ${event}`, {
              currentTime: player.currentTime,
              duration: player.duration
            });
          });
        });
      }
    }

    // Check for Video.js
    if (window.videojs && window.videojs.players) {
      const playerIds = Object.keys(window.videojs.players);
      if (playerIds.length > 0) {
        logEvent('PLAYER', 'Video.js player detected', { playerIds });

        playerIds.forEach(id => {
          const player = window.videojs.players[id];
          ['loadstart', 'play', 'pause', 'ended', 'playing'].forEach(event => {
            player.on(event, () => {
              logEvent('PLAYER', `Video.js event: ${event}`, {
                currentTime: player.currentTime(),
                duration: player.duration()
              });
            });
          });
        });
      }
    }
  }, 2000);

  // ========== INITIAL SETUP ==========

  const video = findVideoElement();
  if (video) {
    monitorVideoElement(video);
  } else {
    logEvent('VIDEO', 'No video element found initially - will monitor for new ones');
  }

  // ========== HELPER FUNCTIONS ==========

  window.getEventLog = function() {
    return eventLog;
  };

  window.exportEventLog = function() {
    const json = JSON.stringify(eventLog, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hianime-autoplay-log-${Date.now()}.json`;
    a.click();
    console.log('Event log exported!');
  };

  window.clearEventLog = function() {
    eventLog.length = 0;
    monitoringStartTime = Date.now();
    console.clear();
    console.log('Event log cleared!');
  };

  window.printEventSummary = function() {
    console.log('\n%c=== Event Summary ===', 'background: #333; color: #fff; font-size: 14px; padding: 5px;');
    const categories = {};
    eventLog.forEach(entry => {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    });
    console.table(categories);
    console.log(`Total events: ${eventLog.length}`);
  };

  // ========== USAGE INSTRUCTIONS ==========

  console.log('\n%c=== Available Commands ===', 'background: #333; color: #fff; font-size: 14px; padding: 5px;');
  console.log('%cgetEventLog()%c - Returns array of all logged events', 'color: #4CAF50; font-weight: bold', 'color: inherit');
  console.log('%cexportEventLog()%c - Downloads event log as JSON file', 'color: #4CAF50; font-weight: bold', 'color: inherit');
  console.log('%cclearEventLog()%c - Clears the event log', 'color: #4CAF50; font-weight: bold', 'color: inherit');
  console.log('%cprintEventSummary()%c - Shows summary of events by category', 'color: #4CAF50; font-weight: bold', 'color: inherit');
  console.log('\n%cNow play a video and let it autoplay to the next episode!', 'color: #FF9800; font-size: 14px; font-weight: bold');

})();
