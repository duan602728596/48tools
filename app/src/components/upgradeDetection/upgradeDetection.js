import { notification } from 'antd';
import packageJson from '../../../package.json';
const request: Function = global.require('request');

/* 软件升级检测 */
const { version }: { version: string } = packageJson;
const uri: string = 'https://raw.githubusercontent.com/duan602728596/48tools/master/app/package.json';
const isUpgradeReminder: string = localStorage.getItem('upgradeReminder');

function update(): void{
  request({ uri }, function(err: Error, response: Object, body: string): void{
    const newPackageJson: Object = JSON.parse(body);

    if(version !== newPackageJson.version){
      notification.warning({
        message: '软件版本已更新',
        description: `软件版本已更新，请及时下载。📌当前版本：${ version }。📡最新版本：${ newPackageJson.version }。`,
        duration: 5
      });
    }
  });
}

if(isUpgradeReminder === 'true' || !isUpgradeReminder) update();