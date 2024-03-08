/**
 * 异步加载script脚本
 * @param { string } src - 脚本地址
 * @param { string } id - 脚本唯一id
 */
function loadScript(src: string, id: string): Promise<void> | void {
  const scriptId: string = `__loadScript__${ id }`;

  if (document.getElementById(scriptId)) {
    return;
  }

  return new Promise((resolve: Function, reject: Function): void => {
    let scriptElement: HTMLScriptElement | null = document.createElement('script');

    function handleScriptLoad(event: Event): void {
      scriptElement?.removeEventListener('load', handleScriptLoad);
      scriptElement = null;
      resolve();
    }

    scriptElement.addEventListener('load', handleScriptLoad);
    scriptElement.id = scriptId;
    scriptElement.src = src;
    document.body.appendChild(scriptElement);
  });
}

export default loadScript;