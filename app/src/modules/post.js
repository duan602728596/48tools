/**
 * 获取直播信息数据
 * url   : 'https://plive.48.cn/livesystem/api/live/v1/memberLivePage'
 * method: POST
 */
const https = node_require('https');

const headers = {
  'os': 'android',
  'User-Agent': 'Mobile_Pocket',
  'IMEI': '864394020228161',
  'token': '0',
  'version': '4.0.4',
  'Content-Type': 'application/json;charset=utf-8',
  'Host': 'plive.48.cn',
  'Connection': 'Keep-Alive',
  'Accept-Encoding': 'gzip'
};

const options = {
  hostname: 'plive.48.cn',
  port: null,
  path: '/livesystem/api/live/v1/memberLivePage',
  method: 'POST',
  headers: headers
};

/* post数据 */
function postData(number){
  return `{"lastTime":${ number },"limit":20,"groupId":0,"memberId":0,"type":0,"giftUpdTime":1490857731000}`;
}

function post(number = 0){
  return new Promise((resolve, reject)=>{
    const req = https.request(options, (res)=>{
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
      console.log('错误：' + err.message);
    });

    req.write(postData(number));
    req.end();
  });
}

export default post;