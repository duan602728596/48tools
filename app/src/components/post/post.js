/**
 * 获取直播和录播信息数据
 * url   : https://pocketapi.48.cn/live/api/v1/live/getLiveList
 * method: POST
 */
import { getProxyIp } from '../proxy/index';
const request = global.require('request');

function rStr(len) {
  const str = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result = '';

  for (let i = 0; i < len; i++) {
    const rIndex = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

function createHeaders() {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '6.0.1',
      appBuild: '190420',
      osVersion: '11.4.1',
      osType: 'ios',
      deviceName: 'iPhone 6s',
      os: 'ios'
    }),
    'User-Agent': 'PocketFans201807/6.0.1 (iPhone; iOS 11.4.1; Scale/2.00)',
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn'
  };
}

/**
 * 获取单个直播间的信息
 * @param { string } liveId
 */
export function getLiveInfo(liveId) {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://pocketapi.48.cn/live/api/v1/live/getLiveOne',
      method: 'POST',
      headers: createHeaders(),
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
  return new Promise((resolve, reject) => {
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
      headers: createHeaders(),
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