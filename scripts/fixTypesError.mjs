import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd } from './utils.mjs';

const nodeModules = path.join(cwd, 'node_modules');

async function replaceWebsocket(fp, ws) {
  const filePath = path.join(nodeModules, fp);
  const file = await fsP.readFile(filePath, { encoding: 'utf8' });
  const replaceValue = `window.${ ws }||window.WebSocket`;

  if (file.includes(replaceValue)) return;

  const newFile = file.replace(/window\.WebSocket/g, replaceValue);

  await fsP.writeFile(filePath, newFile, { encoding: 'utf8' });
}

async function fixTypesError() {
  const reduxToolkitFilePath = path.join(nodeModules, '@reduxjs/toolkit/src/query/react/module.ts');
  const reduxToolkitFile = await fsP.readFile(reduxToolkitFilePath, { encoding: 'utf8' });

  await fsP.writeFile(reduxToolkitFilePath, `// @ts-nocheck\n${ reduxToolkitFile }`, { encoding: 'utf8' });

  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_NIM_Websocket'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_QCHAT_Websocket')
  ]);
}

fixTypesError();