// Popup script for toggling auto-fullscreen settings

const manualEpisodeToggle = document.getElementById('manualEpisodeToggle');
const autoplayEpisodeToggle = document.getElementById('autoplayEpisodeToggle');

// Load current state with defaults
browser.storage.local.get({
  enableManualEpisode: true,
  enableAutoplayEpisode: true
})
  .then((result) => {
    manualEpisodeToggle.checked = result.enableManualEpisode;
    autoplayEpisodeToggle.checked = result.enableAutoplayEpisode;
  })
  .catch((error) => {
    console.error('Error loading settings:', error);
    manualEpisodeToggle.checked = true;
    autoplayEpisodeToggle.checked = true;
  });

// Helper function to save toggle state
function saveToggleSetting(key, value) {
  browser.storage.local.set({ [key]: value })
    .catch((error) => {
      console.error(`Error saving ${key}:`, error);
    });
}

// Save state when toggles change
manualEpisodeToggle.addEventListener('change', () => {
  saveToggleSetting('enableManualEpisode', manualEpisodeToggle.checked);
});

autoplayEpisodeToggle.addEventListener('change', () => {
  saveToggleSetting('enableAutoplayEpisode', autoplayEpisodeToggle.checked);
});
