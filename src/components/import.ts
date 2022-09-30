export async function dynamicImport(
  scope: string | undefined,
  module: string | undefined,
  url: string | undefined
) {
  // @ts-ignore
  await __webpack_init_sharing__('default');

  await new Promise<void>((resolve, reject) => {
    const element = document.createElement('script');

    if (typeof url === 'string') {
      element.src = url;
    }
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic script loaded: ${url}`);
      element.parentElement?.removeChild(element);
      resolve();
    };

    element.onerror = (err) => {
      console.log(`Dynamic script error: ${url}`);
      element.parentElement?.removeChild(element);
      reject(err);
    };

    document.head.appendChild(element);
  });

  // @ts-ignore
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);

  const factory = await container.get(module);
  return factory();
}
