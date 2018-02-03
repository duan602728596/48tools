export var getFlvUrl = function(cid, sign) {
  var url;
  url = `https://interface.bilibili.com/playurl?cid=${cid}` + `&appkey=84956560bc028eb7&otype=json&type=&quality=0&qn=0&sign=${sign}`;
  return new Promise(function(resolve, reject) {
    var request;
    request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.addEventListener('readystatechange', function(event) {
      var data;
      if (request.readyState === 4) {
        data = JSON.parse(request.response);
        return resolve(data);
      }
    }, false);
    return request.send();
  });
};

export var queryUrl = function(list) {
  var i, item, len, u, url;
  console.log('List Number: ' + list.length);
  url = [];
  for (i = 0, len = list.length; i < len; i++) {
    item = list[i];
    u = item.url.replace('http:', 'https:');
    url.push(u);
  }
  return url;
};

export var download = function(url) {
  return fetch(url, {
    'method': 'GET',
    'cache': 'default'
  }, 86400000).then(function(response) {
    return response.blob();
  }).then(function(blob) {
    return window.URL.createObjectURL(blob);
  });
};
