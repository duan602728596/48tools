import path from 'node:path';
import fsP from 'node:fs/promises';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { rimraf } from 'rimraf';
import fse from 'fs-extra/esm';
import builder from 'electron-builder';
import { makeUniversalApp } from '@electron/universal';
import { cwd, appDir, wwwDir, staticsDir, build, output, unpacked, isMacOS, isOld } from './utils.mjs';
import taskfile from './taskfile.mjs';
import packageJson from '../package.json' assert { type: 'json' };

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
 * @param { string } outputDir - 输出文件夹
 * @param { [string, object] | undefined } target - 重写编译目标
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
      '!**/node_modules/*/AUTHORS',
      '!version.json',
      '!package-lock.json',
      '!**/node_modules/.package-lock.json',
      '!**/dependenciesOtherFiles.json'
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
    npmRebuild: false,
    electronDownload: {
      version: electronDownloadVersion
    },
    directories: {
      app: wwwDir,
      output: outputDir
    },
    asar: false
  };

  // 重写编译目标
  if (target) {
    cfg[target[0]].target = [target[1]];
  }

  return cfg;
}

/**
 * 拷贝文件
 * @param { string } unpackedDir - 拷贝目录
 * @param { boolean } isMac - 是否为mac系统
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

/* 压缩package.json */
async function uglifyPackageJson() {
  const json = await fse.readJSON(path.join(appDir, 'package.json'));

  await fsP.writeFile(path.join(wwwDir, 'package.json'), JSON.stringify(json), { encoding: 'utf8' });
}

/* 打包脚本 */
async function unpack() {
  // 删除中间代码文件夹和编译后的文件夹
  await Promise.all([
    rimraf(wwwDir),
    rimraf(build)
  ]);

  // 拷贝编译的临时文件到中间代码文件夹
  const packages = path.join(cwd, 'packages');

  await taskfile();
  await fse.copy(appDir, wwwDir);
  await Promise.all([
    uglifyPackageJson(),
    fse.copy(path.join(packages, 'main/lib'), path.join(wwwDir, 'boot')),
    fse.copy(path.join(packages, '48tools/dist'), path.join(wwwDir, 'view'))
  ]);
  // await command('npm', ['install', '--production', '--legacy-peer-deps=true'], wwwDir);

  // 编译mac
  if (isMacOS) {
    if (isOld) {
      // 编译mac
      console.log('⏳正在编译：mac');
      try {
        await builder.build({
          targets: builder.Platform.MAC.createTarget(),
          config: config(output.mac)
        });
      } catch (err) {
        console.error(err);
      }

      // 编译mac-arm64
      console.log('⏳正在编译：mac-arm64');
      try {
        await builder.build({
          targets: builder.Platform.MAC.createTarget(),
          config: config(output.macArm64, ['mac', { target: 'dir', arch: 'arm64' }])
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      // 编译mac
      console.log('⏳正在编译：mac');
      try {
        await builder.build({
          targets: builder.Platform.MAC.createTarget(),
          config: config(output._mac)
        });
      } catch (err) {
        console.error(err);
      }

      // 编译mac-arm64
      console.log('⏳正在编译：mac-arm64');
      try {
        await builder.build({
          targets: builder.Platform.MAC.createTarget(),
          config: config(output._macArm64, ['mac', { target: 'dir', arch: 'arm64' }])
        });
      } catch (err) {
        console.error(err);
      }

      // 合并mac和mac-arm64
      console.log('⏳正在编译：合并mac和mac-arm64');
      try {
        await makeUniversalApp({
          x64AppPath: path.join(unpacked._mac, '48tools.app'),
          arm64AppPath: path.join(unpacked._macArm64, '48tools.app'),
          outAppPath: path.join(unpacked.mac, '48tools.app')
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  // 编译win64
  console.log('⏳正在编译：win64');
  try {
    await builder.build({
      targets: builder.Platform.WINDOWS.createTarget(),
      config: config(output.win)
    });
  } catch (err) {
    console.error(err);
  }

  // 编译win32
  console.log('⏳正在编译：win32');
  try {
    await builder.build({
      targets: builder.Platform.WINDOWS.createTarget(),
      config: config(output.win32, ['win', { target: 'dir', arch: 'ia32' }])
    });
  } catch (err) {
    console.error(err);
  }

  // 编译linux
  console.log('⏳正在编译：linux');
  try {
    await builder.build({
      targets: builder.Platform.LINUX.createTarget(),
      config: config(output.linux)
    });
  } catch (err) {
    console.error(err);
  }

  await setTimeoutPromise(60_000 * 3);
  console.log(build, await fsP.readdir(build));

  // 拷贝许可文件
  console.log('🚚正在拷贝许可文件');
  await Promise.all([
    ...isMacOS ? copy(unpacked.mac, true) : [],
    ...(isMacOS && isOld) ? copy(unpacked.macArm64, true) : [],
    ...copy(unpacked.win),
    ...copy(unpacked.win32),
    ...copy(unpacked.linux)
  ]);
}

unpack();