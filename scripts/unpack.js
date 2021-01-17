const util = require('util');
const path = require('path');
const rimraf = require('rimraf');
const fse = require('fs-extra');
const builder = require('electron-builder');
const _ = require('lodash');
const packageJson = require('../package.json');

const rimrafPromise = util.promisify(rimraf);

const cwd = path.join(__dirname, '../');
const appDir = path.join(cwd, 'www');
const staticsDir = path.join(cwd, 'statics');
const build = path.join(cwd, 'build');

/* 打包脚本 */
async function unpack() {
  // 删除
  await Promise.all([
    rimrafPromise(appDir),
    rimrafPromise(build)
  ]);

  // 拷贝文件
  await fse.copy(path.join(cwd, 'packages/app'), appDir);
  await Promise.all([
    fse.copy(path.join(cwd, 'packages/main/lib'), path.join(appDir, 'bin/lib')),
    fse.copy(path.join(cwd, 'packages/48tools/dist'), path.join(appDir, 'dist'))
  ]);

  // 配置
  const config = {
    appId: '48tools',
    productName: '48tools',
    copyright: '段昊辰',
    files: [
      '**/*',
      '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
      '!**/node_modules/*/*.md',
      '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
      '!**/node_modules/*.d.ts',
      '!**/node_modules/*.ts',
      '!**/node_modules/.bin',
      '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
      '!.editorconfig',
      '!**/._*',
      '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
      '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
      '!**/{appveyor.yml,.travis.yml,circle.yml}',
      '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
      '!**/node_modules/*/{.editorconfig,.eslintignore}',
      '!**/node_modules/*/*.{yml,yaml}',
      '!**/node_modules/*/{LICENSE,license,License}',
      '!**/node_modules/*/AUTHORS'
    ],
    mac: {
      target: 'dir',
      icon: path.join(staticsDir, 'titleBarIcon.icns')
    },
    win: {
      target: 'dir',
      icon: path.join(staticsDir, 'titleBarIcon.ico')
    },
    electronDownload: {
      version: packageJson.dependencies.electron
    }
  };

  // 编译
  await builder.build({
    targets: builder.Platform.MAC.createTarget(),
    config: {
      ..._.cloneDeep(config),
      directories: {
        app: appDir,
        output: path.join(build, 'mac')
      }
    }
  });

  await builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: {
      ..._.cloneDeep(config),
      directories: {
        app: appDir,
        output: path.join(build, 'win')
      }
    }
  });

  await Promise.all([
    fse.copy(path.join(cwd, 'LICENSE'), path.join(build, 'mac/mac/LICENSE')),
    fse.copy(path.join(cwd, 'README.md'), path.join(build, 'mac/mac/README.md')),
    fse.copy(path.join(cwd, 'win/win-unpacked/LICENSE.electron.txt'), path.join(build, 'mac/mac/LICENSE.electron.txt')),
    fse.copy(path.join(cwd, 'win/win-unpacked/LICENSES.chromium.html'), path.join(build, 'mac/mac/LICENSES.chromium.html')),

    fse.copy(path.join(cwd, 'LICENSE'), path.join(build, 'win/win-unpacked/LICENSE')),
    fse.copy(path.join(cwd, 'README.md'), path.join(build, 'win/win-unpacked/README.md'))
  ]);
}

unpack();