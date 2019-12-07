import $ from 'jquery';

const request = global.require('request');

const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36'
  + ' (KHTML, like Gecko) Chrome/79.0.3945.45 Safari/537.36 Edg/79.0.309.30';

/**
 * 获取html
 * @param { string } roomid: 房间id
 */
export function getLiveHtml(roomid) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://live.bilibili.com/${ roomid }`,
      type: 'GET',
      async: true,
      success(result, status, xhr) {
        resolve(result);
      },
      error(xhr, err) {
        reject(err);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}