const http = global.require('http');
const cheerio = global.require('cheerio');

const headers: Object = {
  'Host': 'live.bilibili.com',
  'X-Requested-With': 'ShockwaveFlash/25.0.0.148',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
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
      hostname: 'live.bilibili.com',
      port: null,
      path: `/api/playurl?player=1&cid=${ roomid }&quality=0`,
      method: 'GET',
      headers: headers
    };

    const req: any = http.request(options, (res: Object): void=>{
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
    return xml('url')[0].children[0].data.match(/http(s)?:[^\[\]]+/g)[0];
  });
}

export default getUrl;