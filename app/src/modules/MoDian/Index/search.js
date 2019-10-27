import $ from 'jquery';
import modianQuerySign from '@48/modian-query-sign';

/**
 * 获取摩点项目的相关信息
 * @param { string } modianId: 摩点ID
 */
export function searchTitle(modianId) {
  // 计算签名
  const data = { pro_id: modianId };

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: 'https://wds.modian.com/api/project/detail',
      cache: true,
      data: {
        ...data,
        sign: modianQuerySign(data)
      },
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

export function searchTitleNoIdol(modianId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: 'http://sapi.modian.com/v45/main/productInfo',
      cache: true,
      data: `pro_id=${ modianId }`,
      dataType: 'json',
      success(data, status, xhr) {
        const data2 = data.data.product_info;

        resolve({
          title: data2.name,                  // 标题
          already_raised: data2.backer_money, // 已打赏金额
          moxiId: data2.moxi_post_id
        });
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
  const data = { pro_id: modianid, page, type };

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: 'https://wds.modian.com/api/project/rankings',
      data: {
        ...data,
        sign: modianQuerySign(data)
      },
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