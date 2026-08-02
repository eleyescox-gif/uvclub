/**
 * Utility to compress images (File or Base64) to WebP format targeting ~60-100KB.
 */

export async function compressImageToWebP(
  input: File | string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If input is already a very short base64 string (<100KB), return as is
    if (typeof input === "string" && input.length < 120000) {
      resolve(input);
      return;
    }

    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions respecting aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(typeof input === "string" ? input : "");
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export as image/webp with quality (target 60-100KB)
      const compressedDataUrl = canvas.toDataURL("image/webp", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      if (typeof input === "string") resolve(input);
      else reject(err);
    };

    if (typeof input === "string") {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
  });
}
