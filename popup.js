// Popup script for toggling auto-fullscreen settings

const manualEpisodeToggle = document.getElementById('manualEpisodeToggle');
const autoplayEpisodeToggle = document.getElementById('autoplayEpisodeToggle');

// Load current state
browser.storage.local.get(['enableManualEpisode', 'enableAutoplayEpisode'])
  .then((result) => {
    // Default both to true if not set
    manualEpisodeToggle.checked = result.enableManualEpisode !== false;
    autoplayEpisodeToggle.checked = result.enableAutoplayEpisode !== false;
  })
  .catch((error) => {
    console.error('Error loading settings:', error);
    // Use defaults (both enabled)
    manualEpisodeToggle.checked = true;
    autoplayEpisodeToggle.checked = true;
  });

// Save state when manual episode toggle changes
manualEpisodeToggle.addEventListener('change', () => {
  browser.storage.local.set({ enableManualEpisode: manualEpisodeToggle.checked })
    .catch((error) => {
      console.error('Error saving manual episode setting:', error);
    });
});

// Save state when autoplay episode toggle changes
autoplayEpisodeToggle.addEventListener('change', () => {
  browser.storage.local.set({ enableAutoplayEpisode: autoplayEpisodeToggle.checked })
    .catch((error) => {
      console.error('Error saving autoplay episode setting:', error);
    });
});
