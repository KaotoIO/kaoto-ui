export async function dynamicImport (scope: string, module: string, url: string) {
  await __webpack_init_sharing__('default');

  await new Promise<void>((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
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

  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);

  const factory = await container.get(module);
  const Module = factory();
  return Module;
}
