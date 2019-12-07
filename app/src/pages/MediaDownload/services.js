const request = global.require('request');

const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) '
  + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36';

/**
 * 获取html
 * @param { string } av: av号
 * @param { number } page: 页数
 */
export function getVideoHtml(av, page = 1) {
  const options = {
    uri: `https://www.bilibili.com/video/av${ av }/`,
    method: 'GET',
    qs: { p: page },
    headers: {
      'User-Agent': ua
    },
    gzip: true
  };

  return new Promise((resolve, reject) => {
    request(options, function(err, res, date) {
      if (err) {
        reject(err);
      } else {
        resolve(date);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取视频地址的接口
 * @param { string } av: av号
 * @param { string } cid: 视频的cid
 * @param { string } sessdata: cookie
 */
export function getPlayUrl(av, cid, sessdata) {
  const options = {
    uri: 'https://api.bilibili.com/x/player/playurl',
    method: 'GET',
    json: true,
    headers: {
      Cookie: `SESSDATA=${ sessdata }; CURRENT_QUALITY=80;`
    },
    qs: {
      avid: av,
      cid,
      qn: 80,
      otype: 'json',
      fnver: 0,
      fnval: 16
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取音频的地址接口
 * @param { string } au: au号
 */
export function getAudioPlayUrl(au) {
  const options = {
    uri: 'https://www.bilibili.com/audio/music-service-c/web/url',
    method: 'GET',
    json: true,
    qs: {
      sid: au,
      privilege: 2,
      quality: 2
    },
    gzip: true
  };

  return new Promise((resolve, reject) => {
    request(options, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 下载视频和音频
 * @param { string } uri: 视频或音频地址
 * @param { string } cid: cid
 * @param { string } type: 类型
 */
export function downloadMedia(uri, cid, type = 'video') {
  const options = {
    uri,
    encoding: null,
    headers: {
      Referer: `https://www.bilibili.com/${ type }/${ type === 'audio' ? 'au' : 'av' }${ cid }`,
      Range: 'bytes=0-',
      'User-Agent': ua,
      Origin: 'https://www.bilibili.com'
    }
  };

  return new Promise((resolve, reject) => {
    request(options, function(err, res, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}