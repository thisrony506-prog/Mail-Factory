export const BKASH_LOGO = "https://files.catbox.moe/4o764h.png";
export const NAGAD_LOGO = "https://files.catbox.moe/ft78m4.jpeg";
export const USDT_LOGO = "https://files.catbox.moe/217tw4.png";

// Preload images immediately
if (typeof window !== 'undefined') {
  [BKASH_LOGO, NAGAD_LOGO, USDT_LOGO].forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}
