// HiAnime Auto Fullscreen Extension
// This script monitors for episode changes and automatically triggers fullscreen

(function() {
  'use strict';

  // Configuration constants
  const CONFIG = {
    DEBUG_MODE: false, // Set to true during development to see console logs
    FULLSCREEN_DELAY_MS: 1000,
    PLAY_EVENT_DELAY_MS: 500,
    POLL_INTERVAL_MS: 2000,
    AUTOPLAY_MONITOR_DURATION_MS: 15000,
    AUTOPLAY_CHECK_INTERVAL_MS: 200
  };

  // State variables
  let enableManualEpisode = true;
  let enableAutoplayEpisode = true;
  let lastVideoSrc = null;
  let hasTriggeredFullscreen = false;
  let isAutoplayTransition = false;
  let autoplayCheckInterval = null; // Track interval to prevent memory leaks

  function log(...args) {
    if (CONFIG.DEBUG_MODE) {
      console.log('[HiAnime AutoFS]', ...args);
    }
  }

  // Helper function to check if currently in fullscreen mode
  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  // Helper function to clear autoplay monitoring interval
  function clearAutoplayInterval() {
    if (autoplayCheckInterval) {
      clearInterval(autoplayCheckInterval);
      autoplayCheckInterval = null;
    }
  }

  // Function to find the video player
  function findVideoPlayer() {
    // Common video player selectors for HiAnime
    const selectors = [
      'video',
      '#player video',
      '.video-player video',
      'iframe',
      '.plyr video'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        log('Found video element:', selector);
        return element;
      }
    }
    return null;
  }

  // Function to trigger fullscreen
  function triggerFullscreen() {
    // Check which setting applies based on transition type
    const isEnabled = isAutoplayTransition ? enableAutoplayEpisode : enableManualEpisode;

    if (!isEnabled) {
      log(`Auto-fullscreen disabled for ${isAutoplayTransition ? 'autoplay' : 'manual'} episodes`);
      return;
    }

    log(`Triggering fullscreen for ${isAutoplayTransition ? 'autoplay' : 'manual'} episode`);

    // Check if already in fullscreen mode
    if (isFullscreen()) {
      log('Already in fullscreen mode - maintaining fullscreen state');
      hasTriggeredFullscreen = true;
      return;
    }

    log('Attempting to enter fullscreen mode');

    // Find fullscreen button (multiple strategies)
    const fullscreenSelectors = [
      '.plyr__controls button[data-plyr="fullscreen"]',
      '.vjs-fullscreen-control',
      'button[aria-label*="fullscreen" i]',
      'button[title*="fullscreen" i]',
      '.fullscreen-btn',
      '.plyr__control--overlaid' // Sometimes the big play button
    ];

    let fullscreenBtn = null;
    for (const selector of fullscreenSelectors) {
      fullscreenBtn = document.querySelector(selector);
      if (fullscreenBtn) {
        log('Found fullscreen button:', selector);
        break;
      }
    }

    if (fullscreenBtn) {
      log('Clicking fullscreen button');
      fullscreenBtn.click();
      hasTriggeredFullscreen = true;
    } else {
      // Fallback: use native fullscreen API with multi-monitor support
      const video = findVideoPlayer();
      const videoContainer = video?.closest('.plyr, .video-player, #player') || video;
      const targetElement = videoContainer || video;

      if (targetElement) {
        log('Using native fullscreen API on:', targetElement.tagName);

        // Request fullscreen with options for multi-monitor support
        const fullscreenOptions = {
          navigationUI: 'hide' // Hide browser UI in fullscreen
        };

        try {
          const fullscreenMethods = [
            { method: 'requestFullscreen', supportsOptions: true },
            { method: 'mozRequestFullScreen', supportsOptions: false },
            { method: 'webkitRequestFullscreen', supportsOptions: false },
            { method: 'msRequestFullscreen', supportsOptions: false }
          ];

          for (const { method, supportsOptions } of fullscreenMethods) {
            if (targetElement[method]) {
              const result = supportsOptions
                ? targetElement[method](fullscreenOptions)
                : targetElement[method]();

              if (result && result.then) {
                result.then(() => {
                  log('Fullscreen request successful');
                  hasTriggeredFullscreen = true;
                }).catch(err => {
                  log('Fullscreen request failed:', err.message);
                });
              } else {
                hasTriggeredFullscreen = true;
              }
              break;
            }
          }
        } catch (err) {
          log('Exception during fullscreen request:', err);
        }
      } else {
        log('Could not find video player or fullscreen button');
      }
    }
  }

  // Detect when a new episode starts
  function onVideoSourceChange() {
    const video = findVideoPlayer();
    if (!video) return;

    const currentSrc = video.src || video.currentSrc;

    if (currentSrc && currentSrc !== lastVideoSrc) {
      log('Video source changed:', lastVideoSrc, '->', currentSrc);
      log('Transition type:', isAutoplayTransition ? 'autoplay' : 'manual');
      lastVideoSrc = currentSrc;
      hasTriggeredFullscreen = false;

      // Wait a bit for the player to be ready
      setTimeout(() => {
        triggerFullscreen();
        // Reset autoplay flag after triggering
        isAutoplayTransition = false;
      }, CONFIG.FULLSCREEN_DELAY_MS);
    }
  }

  // Monitor for video play events
  function onVideoPlay() {
    log('Video play event detected');

    if (!hasTriggeredFullscreen) {
      setTimeout(() => {
        triggerFullscreen();
      }, CONFIG.PLAY_EVENT_DELAY_MS);
    }
  }

  // Monitor for DOM changes (for dynamically loaded videos)
  function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          const video = findVideoPlayer();
          if (video && !video.hasAttribute('data-autofs-monitored')) {
            log('New video element detected via mutation');
            video.setAttribute('data-autofs-monitored', 'true');
            attachVideoListeners(video);
            onVideoSourceChange();
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Monitor for video end (for autoplay detection)
  function onVideoEnded() {
    log('Video ended - autoplay may trigger soon');
    hasTriggeredFullscreen = false;
    isAutoplayTransition = true; // Mark next transition as autoplay

    // Clear any existing interval to prevent memory leaks
    clearAutoplayInterval();

    // Start monitoring more frequently for autoplay transition
    autoplayCheckInterval = setInterval(() => {
      onVideoSourceChange();
    }, CONFIG.AUTOPLAY_CHECK_INTERVAL_MS);

    // Stop frequent checking after configured duration
    setTimeout(() => {
      clearAutoplayInterval();
      log('Stopped frequent autoplay monitoring');
      // Reset autoplay flag if no transition happened
      if (isAutoplayTransition) {
        isAutoplayTransition = false;
      }
    }, CONFIG.AUTOPLAY_MONITOR_DURATION_MS);
  }

  // Attach event listeners to video element
  function attachVideoListeners(video) {
    video.addEventListener('play', onVideoPlay);
    video.addEventListener('ended', onVideoEnded);
    video.addEventListener('loadedmetadata', () => {
      log('Video metadata loaded');
      onVideoSourceChange();
    });
    video.addEventListener('loadstart', () => {
      log('Video load started');
      onVideoSourceChange();
    });
    video.addEventListener('playing', () => {
      log('Video playing event');
      onVideoSourceChange();
    });
  }

  // Monitor fullscreen state changes
  function setupFullscreenMonitor() {
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'msfullscreenchange'
    ];

    fullscreenEvents.forEach(eventName => {
      document.addEventListener(eventName, () => {
        const fullscreenActive = isFullscreen();

        log('Fullscreen state changed:', fullscreenActive ? 'ENTERED' : 'EXITED');

        // If user exits fullscreen, reset the flag so it can trigger again
        if (!fullscreenActive) {
          hasTriggeredFullscreen = false;
          log('Fullscreen exited - auto-fullscreen will trigger on next episode');
        }
      });
    });
  }

  // Monitor URL changes (for single-page applications)
  let lastUrl = location.href;
  function checkUrlChange() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      log('URL changed:', lastUrl, '->', currentUrl);
      lastUrl = currentUrl;

      // Don't reset fullscreen flag if already in fullscreen
      // This maintains fullscreen across episode changes
      if (!isFullscreen()) {
        hasTriggeredFullscreen = false;
      }
      lastVideoSrc = null;

      // Re-initialize after URL change
      setTimeout(init, 1000);
    }
  }

  // Initialize the extension
  function init() {
    log('Initializing HiAnime Auto Fullscreen');

    const video = findVideoPlayer();
    if (video) {
      attachVideoListeners(video);
      video.setAttribute('data-autofs-monitored', 'true');
    }

    // Check for video changes periodically
    setInterval(() => {
      onVideoSourceChange();
      checkUrlChange();
    }, CONFIG.POLL_INTERVAL_MS);

    setupMutationObserver();
    setupFullscreenMonitor();
  }

  // Load settings from storage
  browser.storage.local.get(['enableManualEpisode', 'enableAutoplayEpisode'])
    .then((result) => {
      // Default both to true if not set
      if (result.enableManualEpisode !== undefined) {
        enableManualEpisode = result.enableManualEpisode;
      }
      if (result.enableAutoplayEpisode !== undefined) {
        enableAutoplayEpisode = result.enableAutoplayEpisode;
      }
      log('Auto-fullscreen settings - Manual:', enableManualEpisode, 'Autoplay:', enableAutoplayEpisode);
    })
    .catch((error) => {
      log('Error loading settings from storage:', error);
      // Use defaults (both true)
    });

  // Listen for settings changes
  browser.storage.onChanged.addListener((changes) => {
    if (changes.enableManualEpisode) {
      enableManualEpisode = changes.enableManualEpisode.newValue;
      log('Manual episode fullscreen toggled:', enableManualEpisode);
    }
    if (changes.enableAutoplayEpisode) {
      enableAutoplayEpisode = changes.enableAutoplayEpisode.newValue;
      log('Autoplay episode fullscreen toggled:', enableAutoplayEpisode);
    }
  });

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  log('Content script loaded');
})();
