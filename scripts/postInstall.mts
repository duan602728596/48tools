import { join } from 'node:path';
import { readFile as readFileAsync, writeFile as writeFileAsync } from 'node:fs/promises';
import { cwd, command, node } from './utils.mjs';

const nodeModules: string = join(cwd, 'node_modules');

/**
 * 修复网易云信SDK
 * @param { string } fp - sdk的文件名
 * @param { string } ws - ws的hack名
 */
async function replaceWebsocket(fp: string, ws: string): Promise<void> {
  const filePath: string = join(nodeModules, fp);
  const fileStr: string = await readFileAsync(filePath, { encoding: 'utf8' });
  const fixedComments: string = `/* ${ fp } fixed */`;
  const replaceValue: string = `${ fixedComments } window.${ ws }||window.WebSocket`;

  if (fileStr.includes(fixedComments)) return;

  const newFileStr: string = fileStr.replace(/window\.WebSocket/g, replaceValue);

  await writeFileAsync(filePath, newFileStr, { encoding: 'utf8' });
}

/**
 * 编译插件
 * @param { string } pluginName - 插件名称
 */
async function buildPlugin(pluginName: string): Promise<void> {
  await command(node, ['--run', 'dev'], join(cwd, 'packages', pluginName));
}

/**
 * 修复playwright
 * @param { string } typeFilePath - 文件路径
 */
async function fixPlaywrightType(typeFilePath: string): Promise<void> {
  const fileStr: string = await readFileAsync(typeFilePath, { encoding: 'utf8' });

  if (fileStr.includes('/* playwright/test fixed */')) return;

  let newFileStr: string = fileStr.replace(/\/test';/g, "/test.js';");

  newFileStr += '\n/* playwright/test fixed */';
  await writeFileAsync(typeFilePath, newFileStr, { encoding: 'utf8' });
}

/* 执行postinstall脚本 */
async function postInstall(): Promise<void> {
  // 替换window.WebSocket
  await Promise.all([
    replaceWebsocket('nim-web-sdk-ng/dist/NIM_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_NIM_Websocket'),
    replaceWebsocket('nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK.js', 'HACK_INTERCEPTS_SEND_QCHAT_Websocket')
  ]);

  await Promise.all([
    fixPlaywrightType(join(nodeModules, 'playwright/test.d.ts')), // 修复playwright
    fixPlaywrightType(join(nodeModules, 'playwright-core/index.d.ts'))
  ]);

  // 编译babel插件
  await buildPlugin('babel-plugin-delay-require');

  // 编译postcss插件
  await buildPlugin('postcss-plugin-remove-classnames');
}

postInstall();