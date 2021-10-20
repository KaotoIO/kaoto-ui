export default function createImage (url: string, crossOrigin?: string) {
  if (!url) return;
  const img = document.createElement('img');
  img.crossOrigin = crossOrigin;
  img.src = url;

  return img;
};
