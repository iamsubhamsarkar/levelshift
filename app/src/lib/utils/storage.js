/**
 * LevelShift — localStorage Wrapper
 * Handles persistence, versioning, export/import.
 */

const STORAGE_KEY = 'levelshift_data';
const SCHEMA_VERSION = 1;

/**
 * Get all stored data, or null if nothing exists.
 * @returns {object|null}
 */
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== SCHEMA_VERSION) {
      return migrateData(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('[LevelShift] Failed to load data:', e);
    return null;
  }
}

/**
 * Save data to localStorage.
 * @param {object} data - Full state object
 */
export function saveData(data) {
  try {
    data.version = SCHEMA_VERSION;
    data.lastSaved = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[LevelShift] Failed to save data:', e);
    // If quota exceeded, warn user
    if (e.name === 'QuotaExceededError') {
      alert('Storage full! Please export your data and clear old browser data.');
    }
  }
}

/**
 * Export all data as downloadable JSON file.
 */
export function exportData() {
  const data = loadData();
  if (!data) {
    alert('No data to export.');
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `levelshift-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from a JSON file.
 * @param {File} file - JSON file from file input
 * @returns {Promise<boolean>} - true if successful
 */
export function importData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version || !data.progress) {
          alert('Invalid LevelShift backup file.');
          resolve(false);
          return;
        }
        saveData(data);
        resolve(true);
      } catch (err) {
        alert('Failed to parse backup file.');
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}

/**
 * Clear all stored data (with confirmation).
 * @returns {boolean}
 */
export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
  return true;
}

/**
 * Check how much storage is being used.
 * @returns {{ used: number, limit: number, percentage: number }}
 */
export function getStorageUsage() {
  const raw = localStorage.getItem(STORAGE_KEY) || '';
  const usedBytes = new Blob([raw]).size;
  const limitBytes = 5 * 1024 * 1024; // 5MB conservative estimate
  return {
    used: usedBytes,
    limit: limitBytes,
    percentage: Math.round((usedBytes / limitBytes) * 100)
  };
}

/**
 * Migrate data from older schema versions.
 * @param {object} oldData
 * @returns {object}
 */
function migrateData(oldData) {
  // Future migrations go here
  // For now, just stamp current version
  console.log(`[LevelShift] Migrating data from v${oldData.version} to v${SCHEMA_VERSION}`);
  oldData.version = SCHEMA_VERSION;
  saveData(oldData);
  return oldData;
}
