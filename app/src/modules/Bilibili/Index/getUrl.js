const https = global.require('https');

const headers = {
  Host: 'live.bilibili.com',
  'X-Requested-With': 'ShockwaveFlash/25.0.0.148',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
};

function getUrl(roomid) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.live.bilibili.com',
      port: null,
      path: `/api/playurl?cid=${ roomid }&otype=json&quality=0&platform=web`,
      method: 'GET',
      headers
    };

    const req = https.request(options, (res) => {
      let getData = '';

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        getData += chunk;
      });
      res.on('end', function() {
        resolve(getData);
      });
    });

    req.on('error', function(err) {
      console.log('error: ' + err.message);
    });

    req.write('');
    req.end();
  }).catch((err) => {
    console.error(err);
  });
}

export default getUrl;