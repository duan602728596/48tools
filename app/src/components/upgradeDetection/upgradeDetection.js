import { notification } from 'antd';
import packageJson from '../../../package.json';
const request = global.require('request');

/* 软件升级检测 */
const { version } = packageJson;
const uri = 'https://raw.githubusercontent.com/duan602728596/48tools/master/app/package.json';
const isUpgradeReminder = localStorage.getItem('upgradeReminder');

function update() {
  request({ uri }, function(err, response, body) {
    const newPackageJson = JSON.parse(body);

    if (version !== newPackageJson.version) {
      notification.warning({
        message: '软件版本已更新',
        description: `软件版本已更新，请及时下载。📌当前版本：${ version }。📡最新版本：${ newPackageJson.version }。`,
        duration: 5
      });
    }
  });
}

if (isUpgradeReminder === 'true' || !isUpgradeReminder) update();