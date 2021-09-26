import { spawn } from 'node:child_process';
import { appDir } from './utils.mjs';

/* 安装依赖 */
function npmInstall() {
  console.log('正在安装依赖......');

  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install', '--production', '--legacy-peer-deps=true'], {
      stdio: 'inherit',
      cwd: appDir
    });

    child.on('close', function(code) {
      console.log('依赖安装成功。');
      resolve();
    });

    child.on('error', function(error) {
      console.error('依赖安装失败。');
      reject(error);
    });
  });
}

export default npmInstall;