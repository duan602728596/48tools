const http = global.require('http');
const cheerio = global.require('cheerio');

// http://live.bilibili.com/api/playurl?player=1&cid=#{ room.roomId }&quality=0
const headers = {
  'Host': 'live.bilibili.com',
  'X-Requested-With': 'ShockwaveFlash/25.0.0.148',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
};

function getUrl(roomid){
  return new Promise((resolve, reject)=>{
    const options = {
      hostname: 'live.bilibili.com',
      port: null,
      path: `/api/playurl?player=1&cid=${ roomid }&quality=0`,
      method: 'GET',
      headers: headers
    };

    const req = http.request(options, (res)=>{
      let getData = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk){
        getData += chunk;
      });
      res.on('end', function(){
        resolve(getData);
      });
    });

    req.on('error', function(err){
      console.log('error: ' + err.message);
    });

    req.write('');
    req.end();
  }).then((data)=>{
    const xml = cheerio.load(data);
    return xml('url')[0].children[0].data.match(/http(s)?:[^\[\]]+/g)[0];
  });
}

export default getUrl;