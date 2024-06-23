import { randomUUID } from 'node:crypto';
import type { PromiseWithResolvers } from '@48tools-types/ECMAScript';

const { promise, resolve }: PromiseWithResolvers<void> = Promise.withResolvers();
let ABPyInit: boolean = false;
let timer: NodeJS.Timeout | null = null;

function loadABPyScript(): void {
  if (!ABPyInit) {
    const script: HTMLScriptElement = document.createElement('script');

    script.type = 'py';
    script.src = 'AB.py';
    document.body.appendChild(script);

    timer = setInterval((): void => {
      if (document.getElementById('py-0')) {
        clearTimeout(timer!);
        timer = null;
        ABPyInit = true;
        resolve();
      }
    }, 5_000);
  }
}

/* 计算a_bogus */
export async function getABResult(params: Record<string, string>, ua: string): Promise<string> {
  loadABPyScript();
  await promise;
  return new Promise<string>((resolve: Function, reject: Function): void => {
    const key: string = randomUUID();
    const event: CustomEvent = new CustomEvent('ABogus', {
      detail: {
        params: JSON.stringify(params),
        key,
        ua
      }
    });

    window.addEventListener('ABogusResult', function(e: CustomEvent): void {
      const rKey: string = e['_key'];
      const rResult: string = e['_result'];

      if (key === rKey) {
        resolve(rResult);
      }
    });

    window.dispatchEvent(event);
  });
}