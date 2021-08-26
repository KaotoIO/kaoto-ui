export default function createImage (url, crossOrigin?) {
  if (!url) return;
  const img = document.createElement('img');
  img.crossOrigin = crossOrigin;
  img.src = url;

  return img;
};
