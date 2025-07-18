// Utility to crop image using canvas for react-easy-crop
export default function getCroppedImg(imageSrc: string, crop: any): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        if (!blob) return reject('Canvas is empty');
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = () => reject('Failed to load image');
  });
}
