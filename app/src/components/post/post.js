/**
 * 获取直播和录播信息数据
 * url   : https://pocketapi.48.cn/live/api/v1/live/getLiveList
 * method: POST
 */
const request = global.require('request');

function createHeaders() {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ Math.floor(Math.random() * (10 ** 10)) }`,
      appVersion: '6.0.0',
      appBuild: '190409',
      osVersion: '11.4.1',
      osType: 'ios',
      deviceName: 'iPhone 6s',
      os: 'ios'
    })
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
      body: { liveId }
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
      body
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