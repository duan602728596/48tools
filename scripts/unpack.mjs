import util from 'util';
import path from 'path';
import rimraf from 'rimraf';
import fse from 'fs-extra';
import builder from 'electron-builder';
import { requireJson } from '@sweet-milktea/utils';
import { __dirname, cwd, appDir, staticsDir, build, output, unpacked } from './utils.mjs';

const rimrafPromise = util.promisify(rimraf);

const packageJson = await requireJson(path.join(__dirname, '../package.json'));
const staticsFiles = {
  LICENSE: path.join(cwd, 'LICENSE'),  // 许可协议
  README: path.join(cwd, 'README.md'), // README
  LICENSEElectron: path.join(unpacked.win, 'LICENSE.electron.txt'),   // electron许可协议
  LICENSESChromium: path.join(unpacked.win, 'LICENSES.chromium.html') // chromium第三方许可协议
};
const icon = {
  mac: path.join(staticsDir, 'titleBarIcon.icns'),
  win: path.join(staticsDir, 'titleBarIcon.ico'),
  linux: path.join(staticsDir, 'titleBarIcon_linux.png')
};
const electronDownloadVersion = packageJson.dependencies.electron.replace(/^\^/, '');

/**
 * 编译配置
 * @param { string } outputDir: 输出文件夹
 * @param { [string, object] | undefined } target: 重写编译目标
 */
function config(outputDir, target) {
  const cfg = {
    appId: '48tools',
    productName: '48tools',
    copyright: '段昊辰',
    files: [
      '**/*',
      '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
      '!**/node_modules/*/*.md',
      '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
      '!**/node_modules/*.d.ts',
      '!**/node_modules/*.{ts,tsx}',
      '!**/node_modules/.bin',
      '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
      '!.editorconfig',
      '!**/._*',
      '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
      '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
      '!**/{appveyor.yml,.travis.yml,circle.yml}',
      '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
      '!**/node_modules/*/{.editorconfig,.eslintignore,.eslintrc.js,.eslintrc.cjs,.gitignore}',
      '!**/node_modules/*/*.{yml,yaml}',
      '!**/node_modules/*/{LICENSE,license,License}',
      '!**/node_modules/*/AUTHORS'
    ],
    mac: {
      target: 'dir',
      icon: icon.mac
    },
    win: {
      target: 'dir',
      icon: icon.win
    },
    linux: {
      target: 'dir',
      icon: icon.linux,
      executableName: '48tools'
    },
    electronDownload: {
      version: electronDownloadVersion
    },
    directories: {
      app: appDir,
      output: outputDir
    },
    // 解压node-media-server服务线程使用的文件
    asarUnpack: [
      'node_modules/asar-node',
      'bin/lib/nodeMediaServer/server.worker.js'
    ]
  };

  // 重写编译目标
  if (target) {
    cfg[target[0]].target = [target[1]];
  }

  return cfg;
}

/**
 * 拷贝文件
 * @param { string } unpackedDir: 拷贝目录
 * @param { boolean } isMac: 是否为mac系统
 */
function copy(unpackedDir, isMac) {
  const queue = [
    fse.copy(staticsFiles.LICENSE, path.join(unpackedDir, 'LICENSE')),
    fse.copy(staticsFiles.README, path.join(unpackedDir, 'README.md'))
  ];

  if (isMac) {
    queue.push(
      fse.copy(staticsFiles.LICENSEElectron, path.join(unpackedDir, 'LICENSE.electron.txt')),
      fse.copy(staticsFiles.LICENSESChromium, path.join(unpackedDir, 'LICENSES.chromium.html'))
    );
  }

  return queue;
}

/* 打包脚本 */
async function unpack() {
  // 删除中间代码文件夹和编译后的文件夹
  await Promise.all([
    rimrafPromise(appDir),
    rimrafPromise(build)
  ]);

  // 拷贝编译的临时文件到中间代码文件夹
  const packages = path.join(cwd, 'packages');

  await fse.copy(path.join(packages, 'app'), appDir);
  await Promise.all([
    fse.copy(path.join(packages, 'main/lib'), path.join(appDir, 'bin/lib')),
    fse.copy(path.join(packages, '48tools/dist'), path.join(appDir, 'dist'))
  ]);

  // 编译mac
  await builder.build({
    targets: builder.Platform.MAC.createTarget(),
    config: config(output.mac)
  });

  // 编译mac-arm64
  await builder.build({
    targets: builder.Platform.MAC.createTarget(),
    config: config(output.macArm64, ['mac', { target: 'dir', arch: 'arm64' }])
  });

  // 编译win64
  await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: config(output.win)
  });

  // 编译win32
  await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: config(output.win32, ['win', { target: 'dir', arch: 'ia32' }])
  });

  // 编译linux
  await builder.build({
    targets: builder.Platform.LINUX.createTarget(),
    config: config(output.linux)
  });

  // 拷贝许可文件
  await Promise.all([
    ...copy(unpacked.mac, true),
    ...copy(unpacked.macArm64, true),
    ...copy(unpacked.win),
    ...copy(unpacked.win32),
    ...copy(unpacked.linux)
  ]);
}

unpack();