(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

var getFlvUrl = function(cid, sign) {
  var url;
  url = `https://interface.bilibili.com/playurl?cid=${cid}` + `&appkey=84956560bc028eb7&otype=json&type=&quality=0&qn=0&tid=137&sign=${sign}`;
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

var queryUrl = function(list) {
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

var download = function(url) {
  return fetch(url, {
    'method': 'GET',
    'cache': 'default'
  }, 86400000).then(function(response) {
    return response.blob();
  }).then(function(blob) {
    return window.URL.createObjectURL(blob);
  });
};

var hash;
var location;
var pathname;

location = window.location;

({hash, pathname} = location);

var getHash = function() {
  if (hash === '') {
    return 1;
  } else {
    return Number(hash.match(/\d+/g)[0]);
  }
};

var getAvNumber = function() {
  return pathname.match(/av\d+/ig)[0];
};

/*

 @@@@    @@@   @       @@@   @@@@    @@@   @       @@@
 @   @    @    @        @    @   @    @    @        @
 @@@@     @    @        @    @@@@     @    @        @
 @   @    @    @        @    @   @    @    @        @
 @@@@   @@@@@  @@@@@  @@@@@  @@@@   @@@@@  @@@@@  @@@@@

*/
var CID;
var SIGN;
var av;
var body;
var div;
var page;
var start;

// it from playurl
// change it if need
SIGN = 'a0cfb0ac98c3ec669cd52ea491ba38ab';

CID = window.cid;

body = document.getElementsByTagName('body')[0];

page = getHash();

av = getAvNumber();

div = document.createElement('div');

// init div
div.style.cssText = 'position: fixed; z-index: 100; top: 0; left: 0; padding: 5px; background-color: #fff; border: 5px solid #000;';

body.appendChild(div);

start = async function() {
  var a, blobUrl, flvList, i, index, index2, item, len, result, results, title;
  result = (await getFlvUrl(CID, SIGN));
  flvList = queryUrl(result.durl);
  results = [];
  for (index = i = 0, len = flvList.length; i < len; index = ++i) {
    item = flvList[index];
    index2 = index + 1;
    blobUrl = (await download(item));
    title = `${av}_${page}_${index2}.flv`;
    a = document.createElement('a');
    a.style.cssText = 'display: block; padding: 5px;';
    a.href = blobUrl;
    a.download = title;
    a.innerText = title;
    div.appendChild(a);
    results.push(console.log('Finish: ' + index2));
  }
  return results;
};

start();

})));
