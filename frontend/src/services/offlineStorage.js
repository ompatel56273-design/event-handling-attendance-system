export const saveOfflineIdentity = (profile) => {
  if (!profile) return;
  try {
    localStorage.setItem('eventhub_offline_identity', JSON.stringify({
      ...profile,
      cachedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to cache identity:', err);
  }
};

export const getOfflineIdentity = () => {
  try {
    const raw = localStorage.getItem('eventhub_offline_identity');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const saveOfflinePasses = (passes) => {
  if (!Array.isArray(passes)) return;
  try {
    localStorage.setItem('eventhub_offline_passes', JSON.stringify(passes));
  } catch (err) {
    console.error('Failed to cache passes:', err);
  }
};

export const getOfflinePasses = () => {
  try {
    const raw = localStorage.getItem('eventhub_offline_passes');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};
