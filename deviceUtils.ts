export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

export async function getClientFingerprint(): Promise<{ deviceId: string; ipAddress: string }> {
  let deviceId = safeStorage.getItem('mf_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    safeStorage.setItem('mf_device_id', deviceId);
  }

  let ipAddress = '';
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      ipAddress = data.ip || '';
    }
  } catch {
    try {
      const res2 = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (res2.ok) {
        const data2 = await res2.json();
        ipAddress = data2.ip || '';
      }
    } catch {}
  }

  return { deviceId, ipAddress };
}

export function getUrlParam(param: string): string | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has(param)) {
      return searchParams.get(param);
    }
    const hash = window.location.hash;
    if (hash) {
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const hashQuery = new URLSearchParams(hash.substring(qIndex + 1));
        if (hashQuery.has(param)) {
          return hashQuery.get(param);
        }
      }
      const cleanHash = hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(cleanHash);
      if (hashParams.has(param)) {
        return hashParams.get(param);
      }
    }
  } catch (e) {
    console.warn('Error getting URL param:', e);
  }
  return null;
}
