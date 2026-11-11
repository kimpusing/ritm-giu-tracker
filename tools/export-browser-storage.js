(() => {
  // Run from the GIU page in the browser profile whose records are being preserved.
  const isHostedTracker = location.origin === 'https://ritm-giu-tracker.onrender.com';
  const isLocalTracker = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  if (!isHostedTracker && !isLocalTracker) throw new Error('Open the GIU Tracker page before exporting.');
  const keys = ['giu-nrl-status-tracker', 'giu-requester-details-cache',
    'giu-nrl-user-manager-cache', 'giu-nrl-last-viewed'];
  const storage = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
  const snapshot = { format: 'giu-browser-storage-v1', capturedAt: new Date().toISOString(),
    origin: location.origin, pathname: location.pathname, storage };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'giu-browser-storage-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  console.info('GIU export downloaded. Storage keys present: ' + keys.filter(key => storage[key] !== null).length);
})();
