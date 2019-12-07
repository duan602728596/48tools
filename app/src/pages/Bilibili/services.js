import $ from 'jquery';

/**
 * 获取url
 * @param { string } roomid: 房间id
 */
export function getLiveUrl(roomid) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${ roomid }&qn=10000&platform=web`,
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