import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd } from './utils.mjs';

const nodeModules = path.join(cwd, 'node_modules');

/* 修复网易云信SDK */
async function replaceWebsocket(fp, ws) {
  const filePath = path.join(nodeModules, fp);
  const file = await fsP.readFile(filePath, { encoding: 'utf8' });
  const replaceValue = `window.${ ws }||window.WebSocket`;

  if (file.includes(replaceValue)) return;

  const newFile = file.replace(/window\.WebSocket/g, replaceValue);

  await fsP.writeFile(filePath, newFile, { encoding: 'utf8' });
}

/* 修复rc-util */
async function fixRcUtil() {
  const rcUtilPath = path.join(nodeModules, 'rc-util/es/React/render.js');
  const file = await fsP.readFile(rcUtilPath, { encoding: 'utf8' });

  if (file.includes('/* rc-util fixed */')) return;

  const newFile = file.replace("import * as ReactDOM from 'react-dom';", `import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';`)
    .replace('var fullClone = _objectSpread({}, ReactDOM);', 'var fullClone = _objectSpread({}, ReactDOM, ReactDOMClient);')
    .replace('reactRender(node, container);', '/* rc-util fixed */ try { reactRender(node, container); } catch {}');

  await fsP.writeFile(rcUtilPath, newFile, { encoding: 'utf8' });
}

async function fixTypesError() {
  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_NIM_Websocket'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_QCHAT_Websocket')
  ]);

  // 修复rc-util
  await fixRcUtil();
}

fixTypesError();