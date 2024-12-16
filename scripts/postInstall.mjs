import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd, command, npm } from './utils.mjs';

const nodeModules = path.join(cwd, 'node_modules');

/* 修复网易云信SDK */
async function replaceWebsocket(fp, ws) {
  const filePath = path.join(nodeModules, fp);
  const file = await fsP.readFile(filePath, { encoding: 'utf8' });
  const fixedComments = `/* ${ fp } fixed */`;
  const replaceValue = `${ fixedComments } window.${ ws }||window.WebSocket`;

  if (file.includes(fixedComments)) return;

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

/* 编译插件 */
async function buildPlugin(pluginName) {
  await command(npm, ['run', 'dev'], path.join(cwd, 'packages', pluginName));
}

/* 修复playwright */
async function fixPlaywrightType() {
  const playwrightTypePath = path.join(nodeModules, 'playwright/test.d.ts');
  const file = await fsP.readFile(playwrightTypePath, { encoding: 'utf8' });

  if (file.includes('/* playwright/test fixed */')) return;

  let newFile = file.replace(/\/test';/g, "/test.js';");

  newFile += '\n/* playwright/test fixed */';
  await fsP.writeFile(playwrightTypePath, newFile, { encoding: 'utf8' });
}

/* 执行postinstall脚本 */
async function postInstall() {
  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_NIM_Websocket'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_QCHAT_Websocket')
  ]);

  await Promise.all([
    fixRcUtil(),        // 修复rc-util
    fixPlaywrightType() // 修复playwright
  ]);

  // 编译babel插件
  await buildPlugin('babel-plugin-delay-require');

  // 编译postcss插件
  await buildPlugin('postcss-plugin-remove-classnames');

  // 编译esm -> cjs
  await command(npm, ['run', 'build'], path.join(cwd, 'packages/esm-build'));
}

postInstall();