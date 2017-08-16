// @flow
const https = node_require('https');
const queryString = node_require('querystring');
const cheerio = node_require('cheerio');

const headers1: Object = {
  'Host': 'wds.modian.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
};

/* 获取页面标题 */
export function searchTitle(wdsid: string): Promise{
  const wdsid2 = wdsid.match(/[0-9]+/)[0];
  return new Promise((resolve: Function, reject: Function): void=>{
    const options: {
      hostname: string,
      port: ?number,
      path: string,
      method: string,
      headers: Object
    } = {
      hostname: 'wds.modian.com',
      port: null,
      path: `/show_weidashang_pro/${ wdsid2 }#1`,
      method: 'GET',
      headers: headers1
    };

    const req: any = https.request(options, (res: any): void=>{
      let getData: string = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk: any): void{
        getData += chunk;
      });
      res.on('end', function(): void{
        resolve(getData);
      });
    });

    req.on('error', function(err: any): void{
      console.log('error: ' + err.message);
    });

    req.write('');
    req.end();
  }).then((data: string): string=>{
    const xml: any = cheerio.load(data);
    return xml('.project-detail').children('.title').text();
  });
}

const headers2: Object = Object.assign(headers1, {
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'X-Requested-With': 'XMLHttpRequest'
});

/* 获取排行榜 */
export function paiHang(wdsid: string, type: number = 1): void{
  const wdsid2 = wdsid.match(/[0-9]+/)[0];
  return new Promise((resolve: Function, reject: Function): void=>{
    const options: {
      hostname: string,
      port: ?number,
      path: string,
      method: string,
      headers: Object
    } = {
      hostname: 'wds.modian.com',
      port: null,
      path: `/ajax_backer_list`,
      method: 'POST',
      headers: headers2
    };

    const data: string = queryString.stringify({
      pro_id: Number(wdsid2),
      type,
      page: 1,
      pageSize: 10 ** 5
    });

    const req: any = https.request(options, (res: any): void=>{
      let getData: string = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk: any): void{
        getData += chunk;
      });
      res.on('end', function(): void{
        resolve(getData);
      });
    });

    req.on('error', function(err: any): void{
      console.log('error: ' + err.message);
    });

    req.write(data);
    req.end();
  });
}