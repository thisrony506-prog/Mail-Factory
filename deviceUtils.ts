export async function getClientFingerprint(): Promise<{ deviceId: string; ipAddress: string }> {
  let deviceId = localStorage.getItem('mf_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mf_device_id', deviceId);
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
