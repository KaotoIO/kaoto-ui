import * as React from 'react';

const defaultState = { image: undefined, status: 'loading' };

export default function useImage(url: string, crossOrigin?: string): [
  (
    | HTMLImageElement
    | SVGImageElement
    | HTMLVideoElement
    | HTMLCanvasElement
    | ImageBitmap
    | OffscreenCanvas
    | undefined
    ),
    string
] {
  const res = React.useState(defaultState);
  const image = res[0].image;
  const status = res[0].status;

  const setState = res[1];

  React.useEffect(
    function () {
      if (!url) return;
      const img:HTMLImageElement = document.createElement('img');

      function onload() {
        // @ts-ignore
        setState({ image: img, status: 'loaded' });
      }

      function onerror() {
        setState({ image: undefined, status: 'failed' });
      }

      img.addEventListener('load', onload);
      img.addEventListener('error', onerror);
      crossOrigin && (img.crossOrigin = crossOrigin);
      img.src = url;

      return function cleanup() {
        img.removeEventListener('load', onload);
        img.removeEventListener('error', onerror);
        setState(defaultState);
      };
    },
    [url, crossOrigin, setState]
  );

  // return array because it is better to use in case of several useImage hooks
  // const [background, backgroundStatus] = useImage(url1);
  // const [patter] = useImage(url2);
  return [image, status];
};
