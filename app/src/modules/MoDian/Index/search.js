import $ from 'jquery';
const MD5 = global.require('md5.js');

/**
 * 摩点请求加密方法
 * @param { string } queryStr
 */
const P = 'das41aq6';

function sign(queryStr) {
  const signStr = new MD5().update(queryStr + '&p=' + P).digest('hex');
  const sign = signStr.substr(5, 16);

  return queryStr + `&sign=${ sign }`;
}

/**
 * 获取摩点项目的相关信息
 * @param { string } modianId: 摩点ID
 */
export function searchTitle(modianId) {
  // 计算签名
  const data = sign(`pro_id=${ modianId }`);

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: 'https://wds.modian.com/api/project/detail',
      cache: true,
      data,
      dataType: 'json',
      success(data, status, xhr) {
        if (data.status !== '0') {
          resolve({
            title: null
          });
        } else {
          const data2 = data.data[0];

          resolve({
            title: data2.pro_name,
            already_raised: data2.already_raised
          });
        }
      },
      error(err) {
        reject(err);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/* 获取排行榜 */
export function paiHang(modianid, page, type) {
  // 计算签名
  const data = sign(`page=${ page }&pro_id=${ modianid }&type=${ type }`);

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: 'https://wds.modian.com/api/project/rankings',
      data,
      dataType: 'json',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success(data, status, xhr) {
        resolve(data);
      },
      error(err) {
        reject(err);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/* 摩点接口，每次只能返回二十条数据 */
export function paiHang2(modianid, type) {
  return new Promise(async (resolve, reject) => {
    const _CONTINUE = true;
    let data = [];
    let i = 1;

    while (_CONTINUE) {
      const rt = await paiHang(modianid, i, type);

      if (rt.data.length === 0) {
        break;
      } else {
        data = data.concat(rt.data);
        i += 1;
      }
    }
    resolve(data);
  }).catch((err) => {
    console.error(err);
  });
}