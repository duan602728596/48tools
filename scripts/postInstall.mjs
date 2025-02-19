import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd, command, node } from './utils.mjs';

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

/* 编译插件 */
async function buildPlugin(pluginName) {
  await command(node, ['--run', 'dev'], path.join(cwd, 'packages', pluginName));
}

/**
 * 修复playwright
 * @param { string } typeFilePath - 文件路径
 */
async function fixPlaywrightType(typeFilePath) {
  const file = await fsP.readFile(typeFilePath, { encoding: 'utf8' });

  if (file.includes('/* playwright/test fixed */')) return;

  let newFile = file.replace(/\/test';/g, "/test.js';");

  newFile += '\n/* playwright/test fixed */';
  await fsP.writeFile(typeFilePath, newFile, { encoding: 'utf8' });
}

/* 执行postinstall脚本 */
async function postInstall() {
  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_NIM_Websocket'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_QCHAT_Websocket')
  ]);

  await Promise.all([
    fixPlaywrightType(path.join(nodeModules, 'playwright/test.d.ts')), // 修复playwright
    fixPlaywrightType(path.join(nodeModules, 'playwright-core/index.d.ts'))
  ]);

  // 编译babel插件
  await buildPlugin('babel-plugin-delay-require');

  // 编译postcss插件
  await buildPlugin('postcss-plugin-remove-classnames');
}

postInstall();