/**
 * 获取直播和录播信息数据
 * url   : https://plive.48.cn/livesystem/api/live/v1/memberLivePage
 * method: POST
 */
const https: Object = global.require('https');

const headers: Object = {
  os: 'android',
  'User-Agent': 'Mobile_Pocket',
  IMEI: '864394020228161',
  token: '0',
  version: '4.0.4',
  'Content-Type': 'application/json;charset=utf-8',
  Host: 'plive.48.cn',
  Connection: 'Keep-Alive',
  'Accept-Encoding': 'gzip'
};

const options: {
  hostname: string,
  port: ?number,
  path: string,
  method: string,
  headers: Object
} = {
  hostname: 'plive.48.cn',
  port: null,
  path: '/livesystem/api/live/v1/memberLivePage',
  method: 'POST',
  headers
};

/* post数据 */
function postData(number: number): string{
  return `{"lastTime":${ number },"limit":20,"groupId":0,"memberId":0,"type":0,"giftUpdTime":1490857731000}`;
}

function post(number: number = 0): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    const req: Object = https.request(options, (res: Object): void=>{
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
      console.log('错误：' + err.message);
    });

    req.write(postData(number));
    req.end();
  });
}

export default post;