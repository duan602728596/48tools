const https: Object = global.require('https');

const headers: Object = {
  'Host': 'live.bilibili.com',
  'X-Requested-With': 'ShockwaveFlash/25.0.0.148',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
};

function getUrl(roomid: number): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    const options: {
      hostname: string,
      port: ?number,
      path: string,
      method: string,
      headers: Object
    } = {
      hostname: 'api.live.bilibili.com',
      port: null,
      path: `/api/playurl?cid=${ roomid }&otype=json&quality=0&platform=web`,
      method: 'GET',
      headers
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
  }).catch((err: any): void=>{
    console.error(err);
  });
}

export default getUrl;