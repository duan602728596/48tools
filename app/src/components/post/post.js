/**
 * 获取直播和录播信息数据
 * url   : https://pocketapi.48.cn/live/api/v1/live/getLiveList
 * method: POST
 */
import moment from 'moment';
import { getProxyIp } from '../proxy/index';
const request = global.require('request');

/**
 * 获取pa
 * @param { boolean } getNewPa: 获取新pa
 */
function getPa(getNewPa) {
  const pa = require('./pa'); // 找Lgyzero大佬申请token
  const paToken = localStorage.getItem('paToken');        // 记录pa
  const lastTime = localStorage.getItem('lastGetPaTime'); // 记录获取pa的时间戳（秒）
  const newTime = moment().unix(); // 当前时间戳（秒）

  if (getNewPa || !paToken || !lastTime || newTime - Number(lastTime) >= 1200) {
    return new Promise((resolve, reject) => {
      request({
        uri: `http://116.85.71.166:4848/getPA?userID=${ pa.userID }&token=${ pa.token }`,
        json: true
      }, (err, res, body) => {
        const content = body.content;

        localStorage.setItem('paToken', content);
        localStorage.setItem('lastGetPaTime', moment().unix());
        resolve(content);
      });
    });
  } else {
    return paToken;
  }
}

function rStr(len) {
  const str = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result = '';

  for (let i = 0; i < len; i++) {
    const rIndex = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

async function createHeaders() {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '6.0.16',
      appBuild: '200701',
      osVersion: '13.5.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    }),
    'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn',
    pa: await getPa()
  };
}

/**
 * 获取单个直播间的信息
 * @param { string } liveId
 */
export function getLiveInfo(liveId) {
  return new Promise(async (resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/live/api/v1/live/getLiveOne',
      method: 'POST',
      headers: await createHeaders(),
      json: true,
      body: { liveId },
      timeout: 30000,
      proxy: getProxyIp()
    }, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * 获取直播列表
 * @param { number } next
 * @param { boolean } inLive
 */
function post(next = 0, inLive = false) {
  return new Promise(async (resolve, reject) => {
    const body = {
      debug: true,
      next
    };

    if (inLive) {
      body.groupId = 0;
      body.record = false;
    }

    request({
      uri: 'https://pocketapi.48.cn/live/api/v1/live/getLiveList',
      method: 'POST',
      headers: await createHeaders(),
      json: true,
      body,
      timeout: 30000,
      proxy: getProxyIp()
    }, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export default post;