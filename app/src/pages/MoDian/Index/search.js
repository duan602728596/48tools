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
  });
}

export function paiHangNoIdol(modianid, moxiId, page) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: 'http://mapi.modian.com/v45/product/comment_list',
      data: {
        json_type: 1,
        pro_id: modianid,
        moxi_post_id: moxiId,
        page_index: page * 10,
        page_rows: 10
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
  });
}

/* 摩点接口，每次只能返回二十条数据 */
export async function paiHang2(modianid, type) {
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

  return data;
}

export async function paiHang2Noidol(modianid, moxiId) {
  const _CONTINUE = true;
  let data = [];
  let i = 0;

  while (_CONTINUE) {
    const rt = await paiHangNoIdol(modianid, moxiId, i);

    if (rt.status === '0' && rt.data && rt.data.length > 0) {
      const formatData = [];

      for (const item of rt.data) {
        if (item.pay_amount !== '' || item.pay_amount !== 0 || item.pay_amount !== '0') {
          const pay_amount = Number(item.pay_amount) / 100;

          formatData.push({
            user_id: item.user_id,
            backer_money: pay_amount,
            nickname: item.user_info.username
          });
        }
      }

      data = data.concat(formatData);
      i += 1;
    } else {
      break;
    }
  }

  return data;
}