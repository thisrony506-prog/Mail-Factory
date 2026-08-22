const IMGBB_API_KEY = "a2815ef9a07ce4ef215e0673d3f659fd";

export async function uploadToImgBB(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 500;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64Data);
        formData.append('name', `profile_${Date.now()}`);

        fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData,
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
            return res.json();
          })
          .then((data) => {
            if (data.success && data.data && data.data.url) {
              resolve(data.data.url);
            } else {
              reject(new Error(data.error?.message || 'Upload failed'));
            }
          })
          .catch((err) => reject(err));
      };

      img.onerror = () => reject(new Error('Image failed to load in browser'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
