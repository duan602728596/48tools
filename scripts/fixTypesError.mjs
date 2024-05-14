import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd } from './utils.mjs';

const nodeModules = path.join(cwd, 'node_modules');

async function replaceWebsocket(fp) {
  const filePath = path.join(nodeModules, fp);
  const file = await fsP.readFile(filePath, { encoding: 'utf8' });
  const newFile = file.replace(
    /window\.WebSocket/g, 'window.HACK_INTERCEPTS_SEND_Websocket||window.WebSocket');

  await fsP.writeFile(filePath, newFile, { encoding: 'utf8' });
}

async function fixTypesError() {
  const reduxToolkitFilePath = path.join(nodeModules, '@reduxjs/toolkit/src/query/react/module.ts');
  const reduxToolkitFile = await fsP.readFile(reduxToolkitFilePath, { encoding: 'utf8' });

  await fsP.writeFile(reduxToolkitFilePath, `// @ts-nocheck\n${ reduxToolkitFile }`, { encoding: 'utf8' });

  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js')
  ]);

  const NIMWebSDKFilePath = path.join(nodeModules, '@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK.js');
  const NIMWebSDKFile = await fsP.readFile(NIMWebSDKFilePath, { encoding: 'utf8' });
  const newNIMWebSDKFile = NIMWebSDKFile.replace(
    /\.MozWebSocket/g, '.MozWebSocket||window.HACK_INTERCEPTS_SEND_Websocket');

  await fsP.writeFile(NIMWebSDKFilePath, newNIMWebSDKFile, { encoding: 'utf8' });
}

fixTypesError();