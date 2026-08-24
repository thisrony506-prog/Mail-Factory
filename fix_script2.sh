sed -i '/export let messaging: any = null;/d' firebase.ts
sed -i '/if (typeof window !== '\''undefined'\'' && '\''serviceWorker'\'' in navigator) {/,/}/d' firebase.ts
