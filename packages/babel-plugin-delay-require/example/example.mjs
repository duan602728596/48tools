import { transformAsync } from '@babel/core';
import babelPluginDelayRequire from '../src/index.js';

const code = `
import fs, { promises as fsP } from 'node:fs';
import * as path from 'node:path';
import url from 'node:url';
import { setTimeout } from 'node:timers/promises';
import { app } from 'electron';
import { useState as s } from 'react';

function test1() {
  fsP.writeFile('1.txt', '');

  function test11() {
    fsP.readFile('2.txt');
  }
}

// async function test2() {
//   await setTimeout(500);
//
//   const dir = path.join(__dirname, '2.js');
// }
//
// function test3() {
//   if (fs.existsSync('a.js')) {}
// }
`;

const result = await transformAsync(code, {
  plugins: [[babelPluginDelayRequire, {
    moduleName: ['fs', 'node:fs', 'path', 'node:path', 'electron']
  }]],
  ast: true
});

console.log(result.code);