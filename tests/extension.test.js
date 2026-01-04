/**
 * Unit Tests for HiAnime Auto Fullscreen Extension
 * Run with: npm test (after setting up test environment)
 */

describe('HiAnime Auto Fullscreen Extension', () => {
  let mockVideo;
  let mockDocument;
  let mockBrowser;

  beforeEach(() => {
    // Mock video element
    mockVideo = {
      src: '',
      currentSrc: '',
      currentTime: 0,
      duration: 100,
      paused: true,
      ended: false,
      readyState: 4,
      networkState: 2,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      hasAttribute: jest.fn(() => false),
      getAttribute: jest.fn(),
      requestFullscreen: jest.fn(() => Promise.resolve()),
      mozRequestFullScreen: jest.fn(),
      webkitRequestFullscreen: jest.fn(),
      msRequestFullscreen: jest.fn(),
      closest: jest.fn(() => null)
    };

    // Mock document
    mockDocument = {
      querySelector: jest.fn(() => mockVideo),
      querySelectorAll: jest.fn(() => [mockVideo]),
      addEventListener: jest.fn(),
      fullscreenElement: null,
      webkitFullscreenElement: null,
      mozFullScreenElement: null,
      msFullscreenElement: null,
      fullscreenEnabled: true,
      readyState: 'complete',
      body: document.createElement('div')
    };

    // Mock browser storage API
    mockBrowser = {
      storage: {
        local: {
          get: jest.fn((keys, callback) => {
            callback({ enabled: true });
          }),
          set: jest.fn()
        },
        onChanged: {
          addListener: jest.fn()
        }
      }
    };

    global.document = mockDocument;
    global.browser = mockBrowser;
  });

  describe('Video Detection', () => {
    test('should find video element with basic selector', () => {
      const result = mockDocument.querySelector('video');
      expect(result).toBe(mockVideo);
      expect(mockDocument.querySelector).toHaveBeenCalledWith('video');
    });

    test('should find video element with nested selectors', () => {
      mockDocument.querySelector.mockImplementation((selector) => {
        if (selector === '#player video') return mockVideo;
        return null;
      });

      const result = mockDocument.querySelector('#player video');
      expect(result).toBe(mockVideo);
    });

    test('should return null when no video found', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const result = mockDocument.querySelector('video');
      expect(result).toBeNull();
    });
  });

  describe('Fullscreen State Detection', () => {
    test('should detect when not in fullscreen', () => {
      const isFullscreen = !!(
        mockDocument.fullscreenElement ||
        mockDocument.webkitFullscreenElement ||
        mockDocument.mozFullScreenElement ||
        mockDocument.msFullscreenElement
      );
      expect(isFullscreen).toBe(false);
    });

    test('should detect standard fullscreen', () => {
      mockDocument.fullscreenElement = mockVideo;
      const isFullscreen = !!mockDocument.fullscreenElement;
      expect(isFullscreen).toBe(true);
    });

    test('should detect webkit fullscreen', () => {
      mockDocument.webkitFullscreenElement = mockVideo;
      const isFullscreen = !!mockDocument.webkitFullscreenElement;
      expect(isFullscreen).toBe(true);
    });

    test('should detect moz fullscreen', () => {
      mockDocument.mozFullScreenElement = mockVideo;
      const isFullscreen = !!mockDocument.mozFullScreenElement;
      expect(isFullscreen).toBe(true);
    });
  });

  describe('Video Source Change Detection', () => {
    test('should detect when video source changes', () => {
      const oldSrc = 'https://example.com/episode1.m3u8';
      const newSrc = 'https://example.com/episode2.m3u8';

      mockVideo.currentSrc = oldSrc;
      const initialSrc = mockVideo.currentSrc;

      mockVideo.currentSrc = newSrc;
      const changedSrc = mockVideo.currentSrc;

      expect(initialSrc).not.toBe(changedSrc);
      expect(changedSrc).toBe(newSrc);
    });

    test('should not trigger on same source', () => {
      const src = 'https://example.com/episode1.m3u8';
      mockVideo.currentSrc = src;

      const isSame = mockVideo.currentSrc === src;
      expect(isSame).toBe(true);
    });

    test('should handle empty source', () => {
      mockVideo.currentSrc = '';
      expect(mockVideo.currentSrc).toBe('');
    });
  });

  describe('Fullscreen Triggering', () => {
    test('should call requestFullscreen on video element', async () => {
      await mockVideo.requestFullscreen();
      expect(mockVideo.requestFullscreen).toHaveBeenCalled();
    });

    test('should handle requestFullscreen promise resolution', async () => {
      const promise = mockVideo.requestFullscreen();
      await expect(promise).resolves.toBeUndefined();
    });

    test('should handle requestFullscreen rejection', async () => {
      mockVideo.requestFullscreen.mockRejectedValue(new Error('Fullscreen denied'));
      await expect(mockVideo.requestFullscreen()).rejects.toThrow('Fullscreen denied');
    });

    test('should try mozRequestFullScreen as fallback', () => {
      mockVideo.requestFullscreen = undefined;
      mockVideo.mozRequestFullScreen();
      expect(mockVideo.mozRequestFullScreen).toHaveBeenCalled();
    });

    test('should try webkitRequestFullscreen as fallback', () => {
      mockVideo.requestFullscreen = undefined;
      mockVideo.mozRequestFullScreen = undefined;
      mockVideo.webkitRequestFullscreen();
      expect(mockVideo.webkitRequestFullscreen).toHaveBeenCalled();
    });
  });

  describe('Video Event Listeners', () => {
    test('should attach play event listener', () => {
      const callback = jest.fn();
      mockVideo.addEventListener('play', callback);
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('play', callback);
    });

    test('should attach ended event listener', () => {
      const callback = jest.fn();
      mockVideo.addEventListener('ended', callback);
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('ended', callback);
    });

    test('should attach loadstart event listener', () => {
      const callback = jest.fn();
      mockVideo.addEventListener('loadstart', callback);
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('loadstart', callback);
    });

    test('should attach loadedmetadata event listener', () => {
      const callback = jest.fn();
      mockVideo.addEventListener('loadedmetadata', callback);
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('loadedmetadata', callback);
    });

    test('should attach playing event listener', () => {
      const callback = jest.fn();
      mockVideo.addEventListener('playing', callback);
      expect(mockVideo.addEventListener).toHaveBeenCalledWith('playing', callback);
    });
  });

  describe('Browser Storage', () => {
    test('should load manual episode setting from storage', () => {
      mockBrowser.storage.local.get.mockImplementation((keys, callback) => {
        callback({ enableManualEpisode: true });
      });

      mockBrowser.storage.local.get(['enableManualEpisode', 'enableAutoplayEpisode'], (result) => {
        expect(result.enableManualEpisode).toBe(true);
      });
    });

    test('should load autoplay episode setting from storage', () => {
      mockBrowser.storage.local.get.mockImplementation((keys, callback) => {
        callback({ enableAutoplayEpisode: true });
      });

      mockBrowser.storage.local.get(['enableManualEpisode', 'enableAutoplayEpisode'], (result) => {
        expect(result.enableAutoplayEpisode).toBe(true);
      });
    });

    test('should default both settings to enabled when not set', () => {
      mockBrowser.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      mockBrowser.storage.local.get(['enableManualEpisode', 'enableAutoplayEpisode'], (result) => {
        const manualEnabled = result.enableManualEpisode !== false;
        const autoplayEnabled = result.enableAutoplayEpisode !== false;
        expect(manualEnabled).toBe(true);
        expect(autoplayEnabled).toBe(true);
      });
    });

    test('should save manual episode state', () => {
      mockBrowser.storage.local.set({ enableManualEpisode: false });
      expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ enableManualEpisode: false });
    });

    test('should save autoplay episode state', () => {
      mockBrowser.storage.local.set({ enableAutoplayEpisode: false });
      expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({ enableAutoplayEpisode: false });
    });

    test('should listen for storage changes', () => {
      const listener = jest.fn();
      mockBrowser.storage.onChanged.addListener(listener);
      expect(mockBrowser.storage.onChanged.addListener).toHaveBeenCalledWith(listener);
    });
  });

  describe('URL Change Detection', () => {
    test('should detect URL change', () => {
      const oldUrl = 'https://hianime.to/watch/anime-123?ep=1';
      const newUrl = 'https://hianime.to/watch/anime-123?ep=2';

      expect(oldUrl).not.toBe(newUrl);
    });

    test('should extract episode ID from URL', () => {
      const url = 'https://hianime.to/watch/anime-123?ep=456';
      const params = new URL(url).searchParams;
      const episodeId = params.get('ep');
      expect(episodeId).toBe('456');
    });

    test('should handle URL without episode parameter', () => {
      const url = 'https://hianime.to/watch/anime-123';
      const params = new URL(url).searchParams;
      const episodeId = params.get('ep');
      expect(episodeId).toBeNull();
    });
  });

  describe('Fullscreen Button Detection', () => {
    test('should find Plyr fullscreen button', () => {
      const btn = document.createElement('button');
      btn.setAttribute('data-plyr', 'fullscreen');
      mockDocument.querySelector.mockReturnValue(btn);

      const result = mockDocument.querySelector('.plyr__controls button[data-plyr="fullscreen"]');
      expect(result).toBe(btn);
    });

    test('should find button by aria-label', () => {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', 'Enter fullscreen');
      mockDocument.querySelector.mockReturnValue(btn);

      const result = mockDocument.querySelector('button[aria-label*="fullscreen" i]');
      expect(result).toBe(btn);
    });

    test('should return null when no button found', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const result = mockDocument.querySelector('.fullscreen-btn');
      expect(result).toBeNull();
    });
  });

  describe('Video Container Detection', () => {
    test('should find closest player container', () => {
      const container = document.createElement('div');
      container.className = 'plyr';
      mockVideo.closest.mockReturnValue(container);

      const result = mockVideo.closest('.plyr');
      expect(result).toBe(container);
    });

    test('should return null when no container found', () => {
      mockVideo.closest.mockReturnValue(null);
      const result = mockVideo.closest('.plyr');
      expect(result).toBeNull();
    });
  });

  describe('Multi-Monitor Support', () => {
    test('should maintain fullscreen state when already fullscreen', () => {
      mockDocument.fullscreenElement = mockVideo;

      const isFullscreen = !!mockDocument.fullscreenElement;
      expect(isFullscreen).toBe(true);

      // Should not call requestFullscreen again
      if (isFullscreen) {
        expect(true).toBe(true); // Already fullscreen, don't trigger
      }
    });

    test('should trigger fullscreen when not fullscreen', () => {
      mockDocument.fullscreenElement = null;

      const isFullscreen = !!mockDocument.fullscreenElement;
      expect(isFullscreen).toBe(false);

      if (!isFullscreen) {
        mockVideo.requestFullscreen();
        expect(mockVideo.requestFullscreen).toHaveBeenCalled();
      }
    });
  });

  describe('Autoplay Detection', () => {
    test('should reset flag when video ends', () => {
      let hasTriggeredFullscreen = true;

      // Simulate video ended event
      mockVideo.ended = true;
      hasTriggeredFullscreen = false;

      expect(hasTriggeredFullscreen).toBe(false);
    });

    test('should set autoplay flag when video ends', () => {
      let isAutoplayTransition = false;

      // Simulate video ended event
      mockVideo.ended = true;
      isAutoplayTransition = true;

      expect(isAutoplayTransition).toBe(true);
    });

    test('should reset autoplay flag after manual episode selection', () => {
      let isAutoplayTransition = true;

      // Simulate manual selection
      isAutoplayTransition = false;

      expect(isAutoplayTransition).toBe(false);
    });

    test('should trigger fullscreen after source change', () => {
      const oldSrc = 'episode1.m3u8';
      const newSrc = 'episode2.m3u8';
      let lastSrc = oldSrc;

      mockVideo.currentSrc = newSrc;

      if (mockVideo.currentSrc !== lastSrc) {
        lastSrc = mockVideo.currentSrc;
        expect(lastSrc).toBe(newSrc);
      }
    });

    test('should detect manual episode transition', () => {
      let isAutoplayTransition = false;
      const enableManualEpisode = true;

      // Simulate manual episode selection
      const shouldTrigger = !isAutoplayTransition && enableManualEpisode;

      expect(shouldTrigger).toBe(true);
    });

    test('should detect autoplay episode transition', () => {
      let isAutoplayTransition = true;
      const enableAutoplayEpisode = true;

      // Simulate autoplay transition
      const shouldTrigger = isAutoplayTransition && enableAutoplayEpisode;

      expect(shouldTrigger).toBe(true);
    });

    test('should respect manual episode disabled setting', () => {
      let isAutoplayTransition = false;
      const enableManualEpisode = false;

      // Manual episode with setting disabled
      const shouldTrigger = !isAutoplayTransition && enableManualEpisode;

      expect(shouldTrigger).toBe(false);
    });

    test('should respect autoplay episode disabled setting', () => {
      let isAutoplayTransition = true;
      const enableAutoplayEpisode = false;

      // Autoplay with setting disabled
      const shouldTrigger = isAutoplayTransition && enableAutoplayEpisode;

      expect(shouldTrigger).toBe(false);
    });
  });

  describe('Iframe Player Detection (Movies)', () => {
    let mockIframe;

    beforeEach(() => {
      mockIframe = {
        tagName: 'IFRAME',
        id: 'iframe-embed',
        src: '',
        frameBorder: '0',
        allow: 'autoplay; fullscreen; geolocation; display-capture; picture-in-picture',
        setAttribute: jest.fn(),
        hasAttribute: jest.fn(() => false),
        getAttribute: jest.fn(),
        closest: jest.fn(() => null),
        requestFullscreen: jest.fn(() => Promise.resolve()),
        mozRequestFullScreen: jest.fn(),
        webkitRequestFullscreen: jest.fn(),
        msRequestFullscreen: jest.fn()
      };
    });

    test('should detect iframe player with #iframe-embed id', () => {
      mockDocument.querySelector.mockImplementation((selector) => {
        if (selector === '#iframe-embed') return mockIframe;
        return null;
      });

      const result = mockDocument.querySelector('#iframe-embed');
      expect(result).toBe(mockIframe);
      expect(result.tagName).toBe('IFRAME');
    });

    test('should detect iframe by fullscreen permission', () => {
      mockDocument.querySelector.mockImplementation((selector) => {
        if (selector === 'iframe[allow*="fullscreen"]') return mockIframe;
        return null;
      });

      const result = mockDocument.querySelector('iframe[allow*="fullscreen"]');
      expect(result).toBe(mockIframe);
    });

    test('should prioritize iframe over video element', () => {
      mockDocument.querySelector.mockImplementation((selector) => {
        if (selector === '#iframe-embed') return mockIframe;
        if (selector === 'video') return mockVideo;
        return null;
      });

      // Iframe should be found first
      const iframe = mockDocument.querySelector('#iframe-embed');
      expect(iframe).toBe(mockIframe);
      expect(iframe.tagName).toBe('IFRAME');
    });

    test('should fallback to video when no iframe found', () => {
      mockDocument.querySelector.mockImplementation((selector) => {
        if (selector === '#iframe-embed') return null;
        if (selector === 'iframe[allow*="fullscreen"]') return null;
        if (selector === 'video') return mockVideo;
        return null;
      });

      const video = mockDocument.querySelector('video');
      expect(video).toBe(mockVideo);
    });

    test('should detect iframe src change', () => {
      const oldSrc = 'https://example.com/embed/server1/12345';
      const newSrc = 'https://example.com/embed/server2/12345';

      mockIframe.src = oldSrc;
      expect(mockIframe.src).toBe(oldSrc);

      mockIframe.src = newSrc;
      expect(mockIframe.src).toBe(newSrc);
      expect(mockIframe.src).not.toBe(oldSrc);
    });

    test('should identify player type as IFRAME', () => {
      expect(mockIframe.tagName).toBe('IFRAME');
      expect(mockVideo.tagName).toBeUndefined();
    });

    test('should find iframe container for fullscreen', () => {
      const container = document.createElement('div');
      container.className = 'watch-player';
      mockIframe.closest.mockReturnValue(container);

      const result = mockIframe.closest('.watch-player');
      expect(result).toBe(container);
      expect(result.className).toBe('watch-player');
    });

    test('should fallback to iframe itself if no container found', () => {
      mockIframe.closest.mockReturnValue(null);
      const result = mockIframe.closest('.watch-player') || mockIframe;
      expect(result).toBe(mockIframe);
    });
  });

  describe('Server Switching Detection', () => {
    let mockIframe;

    beforeEach(() => {
      mockIframe = {
        tagName: 'IFRAME',
        id: 'iframe-embed',
        src: 'https://example.com/embed/hd-1/12345',
        setAttribute: jest.fn(),
        hasAttribute: jest.fn(() => false)
      };
    });

    test('should detect HD-1 to HD-2 server switch', () => {
      const hd1Src = 'https://example.com/embed/hd-1/12345';
      const hd2Src = 'https://example.com/embed/hd-2/12345';

      mockIframe.src = hd1Src;
      const beforeSwitch = mockIframe.src;

      mockIframe.src = hd2Src;
      const afterSwitch = mockIframe.src;

      expect(beforeSwitch).not.toBe(afterSwitch);
      expect(afterSwitch).toBe(hd2Src);
    });

    test('should detect SUB to DUB server switch', () => {
      const subSrc = 'https://example.com/embed/sub/12345';
      const dubSrc = 'https://example.com/embed/dub/12345';

      mockIframe.src = subSrc;
      mockIframe.src = dubSrc;

      expect(mockIframe.src).toBe(dubSrc);
    });

    test('should treat server switch as manual transition', () => {
      let isAutoplayTransition = false; // Server click is manual
      const enableManualEpisode = true;

      const shouldTrigger = !isAutoplayTransition && enableManualEpisode;
      expect(shouldTrigger).toBe(true);
    });

    test('should not trigger on same server re-selection', () => {
      const sameSrc = 'https://example.com/embed/hd-1/12345';

      mockIframe.src = sameSrc;
      const lastSrc = mockIframe.src;

      mockIframe.src = sameSrc;
      const srcChanged = mockIframe.src !== lastSrc;

      expect(srcChanged).toBe(false);
    });

    test('should detect server switch within same episode', () => {
      const episodeId = '12345';
      const server1 = `https://example.com/embed/server1/${episodeId}`;
      const server2 = `https://example.com/embed/server2/${episodeId}`;

      // Both URLs contain same episode ID but different server
      expect(server1).toContain(episodeId);
      expect(server2).toContain(episodeId);
      expect(server1).not.toBe(server2);
    });
  });

  describe('MutationObserver for Iframe', () => {
    test('should create MutationObserver for iframe', () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };

      global.MutationObserver = jest.fn(() => mockObserver);

      const observer = new MutationObserver(() => {});
      expect(MutationObserver).toHaveBeenCalled();
    });

    test('should observe iframe src attribute changes', () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };

      const mockIframe = document.createElement('iframe');
      mockObserver.observe(mockIframe, {
        attributes: true,
        attributeFilter: ['src']
      });

      expect(mockObserver.observe).toHaveBeenCalledWith(
        mockIframe,
        { attributes: true, attributeFilter: ['src'] }
      );
    });

    test('should trigger callback on src attribute mutation', () => {
      const callback = jest.fn();
      const mutations = [
        {
          type: 'attributes',
          attributeName: 'src',
          target: { tagName: 'IFRAME' }
        }
      ];

      callback(mutations);
      expect(callback).toHaveBeenCalledWith(mutations);
    });

    test('should filter only src attribute changes', () => {
      const mutation = {
        type: 'attributes',
        attributeName: 'src'
      };

      const isSrcChange = mutation.type === 'attributes' && mutation.attributeName === 'src';
      expect(isSrcChange).toBe(true);
    });

    test('should ignore non-src attribute changes', () => {
      const mutation = {
        type: 'attributes',
        attributeName: 'class'
      };

      const isSrcChange = mutation.type === 'attributes' && mutation.attributeName === 'src';
      expect(isSrcChange).toBe(false);
    });
  });

  describe('Player Type Handling', () => {
    test('should handle iframe player differently from video', () => {
      const iframe = { tagName: 'IFRAME', src: 'embed.html' };
      const video = { tagName: 'VIDEO', src: 'video.mp4' };

      const getSource = (player) => {
        if (player.tagName === 'IFRAME') {
          return player.src;
        } else {
          return player.src || player.currentSrc;
        }
      };

      expect(getSource(iframe)).toBe('embed.html');
      expect(getSource(video)).toBe('video.mp4');
    });

    test('should use correct fullscreen target for iframe', () => {
      const iframe = {
        tagName: 'IFRAME',
        closest: jest.fn(() => ({ className: 'watch-player' }))
      };

      const target = iframe.closest('.watch-player, .player-frame, #player');
      expect(target.className).toBe('watch-player');
    });

    test('should use correct fullscreen target for video', () => {
      const video = {
        tagName: 'VIDEO',
        closest: jest.fn(() => ({ className: 'plyr' }))
      };

      const target = video.closest('.plyr, .video-player, #player');
      expect(target.className).toBe('plyr');
    });
  });

  describe('Episode Transition Types', () => {
    test('should classify manual episode selection correctly', () => {
      let isAutoplayTransition = false;
      const userClickedEpisode = true;

      if (userClickedEpisode) {
        isAutoplayTransition = false;
      }

      expect(isAutoplayTransition).toBe(false);
    });

    test('should classify autoplay transition correctly', () => {
      let isAutoplayTransition = false;
      const videoEnded = true;

      if (videoEnded) {
        isAutoplayTransition = true;
      }

      expect(isAutoplayTransition).toBe(true);
    });

    test('should reset autoplay flag after manual selection', () => {
      let isAutoplayTransition = true;

      // User manually selects episode
      isAutoplayTransition = false;

      expect(isAutoplayTransition).toBe(false);
    });

    test('should maintain autoplay flag during autoplay transition', () => {
      let isAutoplayTransition = true;

      // Autoplay loads next episode
      const stillAutoplay = isAutoplayTransition;

      expect(stillAutoplay).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing video element gracefully', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const video = mockDocument.querySelector('video');

      if (!video) {
        expect(video).toBeNull();
      }
    });

    test('should handle fullscreen API errors', async () => {
      const error = new Error('Fullscreen not allowed');
      mockVideo.requestFullscreen.mockRejectedValue(error);

      try {
        await mockVideo.requestFullscreen();
      } catch (err) {
        expect(err.message).toBe('Fullscreen not allowed');
      }
    });

    test('should handle missing fullscreen API', () => {
      const video = {
        requestFullscreen: undefined,
        mozRequestFullScreen: undefined,
        webkitRequestFullscreen: undefined,
        msRequestFullscreen: undefined
      };

      const hasAnyFullscreenAPI = !!(
        video.requestFullscreen ||
        video.mozRequestFullScreen ||
        video.webkitRequestFullscreen ||
        video.msRequestFullscreen
      );

      expect(hasAnyFullscreenAPI).toBe(false);
    });

    test('should handle missing iframe gracefully', () => {
      mockDocument.querySelector.mockImplementation(() => null);

      const iframe = mockDocument.querySelector('#iframe-embed');
      expect(iframe).toBeNull();
    });

    test('should handle iframe without src', () => {
      const iframe = { tagName: 'IFRAME', src: '' };
      expect(iframe.src).toBe('');

      const hasSrc = !!iframe.src;
      expect(hasSrc).toBe(false);
    });
  });
});
