const MD5 = global.require('md5.js');

/**
 * 摩点请求加密方法
 * @param { string } queryStr
 */
const P: string = 'das41aq6';

function sign(queryStr: string): void{
  const signStr: string = new MD5().update(queryStr + '&p=' + P).digest('hex');
  const sign: string = signStr.substr(5, 16);
  return queryStr + `&sign=${ sign }`;
}

/**
 * 获取摩点项目的相关信息
 * @param { string } modianId: 摩点ID
 */
export function searchTitle(modianId: string): Promise{
  // 计算签名
  const data: string = sign(`pro_id=${ modianId }`);
  return new Promise((resolve: Function, reject: Function): void=>{
    $.ajax({
      type: 'POST',
      url: `https://wds.modian.com/api/project/detail`,
      cache: true,
      data,
      dataType: 'json',
      success: function(data: string, status: string, xhr: XMLHttpRequest): void{
        if(data.status !== '0'){
          resolve({
            title: null
          });
        }else{
          const data2: Object = data.data[0];
          resolve({
            title: data2.pro_name,
            already_raised: data2.already_raised
          });
        }
      },
      error: function(err: any): void{
        reject(err);
      }
    });
  });
}

/* 获取排行榜 */
export function paiHang(modianid: string, page: number, type: number): void{
  // 计算签名
  const data: string = sign(`page=${ page }&pro_id=${ modianid }&type=${ type }`);
  return new Promise((resolve: Function, reject: Function): void=>{
    $.ajax({
      type: 'POST',
      url: `https://wds.modian.com/api/project/rankings`,
      data,
      dataType: 'json',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(data: string, status: string, xhr: XMLHttpRequest): void{
        resolve(data);
      },
      error: function(err: any): void{
        reject(err);
      }
    });
  });
}

/* 摩点接口，每次只能返回二十条数据 */
export function paiHang2(modianid: string, type: number): Promise{
  return new Promise(async (resolve: Function, reject: Function): Promise<void>=>{
    let data: Array = [];
    let i: number = 1;
    while(true){
      const rt: Object = await paiHang(modianid, i, type);
      if(rt.data.length === 0){
        break;
      }else{
        data = data.concat(rt.data);
        i += 1;
      }
    }
    resolve(data);
  });
}