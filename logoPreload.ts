import { NAGAD_BASE64 } from './nagadBase64';

export const BKASH_LOGO = "https://files.catbox.moe/4o764h.png";
export const NAGAD_LOGO = "https://kommodo.ai/i/yIfqigMPVcRqfsstO0FL";
export const NAGAD_DIRECT_LOGO = "https://plain-wnam-prod-public.komododecks.com/202608/23/yIfqigMPVcRqfsstO0FL/image.jpg";
export const USDT_LOGO = "https://files.catbox.moe/217tw4.png";

// Preload images immediately
if (typeof window !== 'undefined') {
  [BKASH_LOGO, NAGAD_DIRECT_LOGO, USDT_LOGO].forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}


