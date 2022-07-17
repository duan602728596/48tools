import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { transformAsync } from '@babel/core';
import babelPluginDelayRequire from '../src/index.js';

const code = `
import fs, { promises as fsP } from 'node:fs';
import * as path from 'node:path';
import url from 'node:url';
import { setTimeout } from 'node:timers/promises';
import { app } from 'electron';
import * as FluentFFmpeg from 'fluent-ffmpeg';
import { useState } from 'react';
import { useEffect } from 'react';
import c1 from 'c';
import c2 from 'c';
import d from 'd';
import * as oicq from 'oicq';

console.log(d);

function test1() {
  const txt = urls.map((o) => \`file '\${path.basename(o)}'\`);
  fsP.writeFile('1.txt', txt);

  function test11() {
    fsP.readFile('2.txt');
  }

  function test12() {
    fsP.readFile('3.txt');

    function test121() {
      fsP.writeFile('4.txt', '');
    }
  }
}

async function test2() {
  await setTimeout(500);

  const dir = path.join(__dirname, '2.js');
}

function test3() {
  if (fs.existsSync('a.js')) {
    url.parse('a.js');
  }
}

function useTest4() {
  const [value, setValue] = useState(12);

  useEffect(() => {}, []);

  return value;
}

let command;

function test5(workerData) {
  const { ffmpeg, playStreamPath, filePath } = workerData;

  if (ffmpeg && ffmpeg !== '') {
    FluentFFmpeg.setFfmpegPath(ffmpeg);
  }

  command = FluentFFmpeg(playStreamPath)
    .inputOptions(['-re', '-accurate_seek'])
    .videoCodec('copy')
    .audioCodec('copy')
    .fps(30)
    .output(filePath)
    .on('end', function() {
      postMessage({ type: 'close' });
    })
    .on('error', function(err, stdout, stderr) {
      if (err.message.includes('ffmpeg exited')) {
        postMessage({ type: 'close' });
      } else {
        postMessage({ type: 'error', error: err });
      }
    });

  command.run();
}

class Test6 {
  c = 12;
  static {
    this.b = 6;
    d = c1;
    e = c2;
  };
  a = path.join('6.js');
}


export function miraiMessageTooicqMessage(miraiMessage) {
  const oicqMessage = [];

  for (const item of miraiMessage) {
    switch (item.type) {
      case 'Plain':
        oicqMessage.push(oicq.segment.text(item.text));
        break;

      case 'Image':
        oicqMessage.push(oicq.segment.image((item.url ?? item.path)));
        break;

      case 'At':
        oicqMessage.push(oicq.segment.at(item.target));
        break;

      case 'AtAll':
        oicqMessage.push({
          type: 'at',
          data: { qq: 'all' }
        });
        break;
    }
  }

  return oicqMessage;
`;

const result = await transformAsync(code, {
  plugins: [[babelPluginDelayRequire, {
    moduleNames: ['fs', 'node:fs', 'path', 'node:path', 'electron', 'fluent-ffmpeg', 'react', 'c', 'd', 'oicq']
  }]],
  ast: true
});

console.log(result.code, '\n');
console.log(result.ast);

await setTimeoutPromise(60_00_000);