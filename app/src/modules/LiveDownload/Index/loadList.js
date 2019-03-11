import $ from 'jquery';
import option from '../../../components/option/option';
const url = global.require('url');
const fs = global.require('fs');
const path = global.require('path');
const cheerio = global.require('cheerio');

const IN_LIVE_URL = {
  SNH48: 'https://live.48.cn/Index/main/club/1',
  BEJ48: 'https://live.48.cn/Index/main/club/2',
  GNZ48: 'https://live.48.cn/Index/main/club/3',
  SHY48: 'https://live.48.cn/Index/main/club/4',
  CKG48: 'https://live.48.cn/Index/main/club/5'
};

/**
 * 使用ajax加载列表
 * @param { string } group
 * @param { number } page
 */
export function loadList(group, page) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${ IN_LIVE_URL[group] }/Index/index/p/${ page }.html`,
      type: 'GET',
      dataType: 'text',
      async: true,
      success(result, status, xhr) {
        resolve(result);
      },
      error(xhr, err) {
        reject(err);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 解析html
 * @param { string } html
 */
export function queryHtml(html) {
  const xml = cheerio.load(html);
  const pSkip = xml('.p-skip');
  const pageLen = pSkip.length === 0 ? 1 : Number(pSkip.text().match(/[0-9]+/g)[0]);
  const videoList = xml('.videos');
  const result = [];

  videoList.map((index, element) => {
    const item = xml(element);
    const href = item.find('a').attr('href');
    const h4 = item.find('h4').text();
    const p = item.find('p').text();
    const id = href.split('/');

    result.push({
      id: id[id.length - 1],
      title: h4,
      secondTitle: p
    });
  });

  return {
    result,
    pageLen
  };
}

/**
 * 获取m3u8地址
 * @param { string } group  : 团
 * @param { string } id     : 视频ID
 * @param { string } quality: 品质
 */
export function getM3U8(group, id, quality) {
  return new Promise((resolve, reject) => {
    const u = IN_LIVE_URL[group].split('/');

    $.ajax({
      url: `https://live.48.cn/Index/invedio/club/${ u[u.length - 1] }/id/${ id }`,
      type: 'GET',
      dataType: 'text',
      async: true,
      success(result, status, xhr) {
        resolve(result);
      },
      error(xhr, err) {
        reject(err);
      }
    });
  }).then((html) => {
    const xml = cheerio.load(html);

    return xml(`#${ quality }_url`).attr('value');
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 获取m3u8并解析和下载
 * @param { string } m3u8Url
 */
export function downloadM3U8(m3u8Url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: m3u8Url,
      type: 'GET',
      dataType: 'text',
      async: true,
      success(result, status, xhr) {
        resolve(result);
      },
      error(xhr, err) {
        reject(err);
      }
    });
  }).then((text) => {
    /* 使用正则解析网址 */
    const u = text.match(/\n[^#\n]*\n/g)[0].replace(/\n/g, '');
    let host = null;

    // 以http或https开头的网址
    if (/^ht{2}ps?/.test(u)) {
      host = '';
    // 以'/'开头的网址
    } else if (/^\/.+$/.test(u)) {
      const q = url.parse(m3u8Url);

      host = q.protocol + '//' + q.hostname;
    // 相对路径
    } else {
      host = m3u8Url.replace(/[^/]+\.m3u8.*/, '');
    }

    return {
      host,
      m3u8: text
    };
  }).then(({ host, m3u8 }) => {
    /* 使用正则替换网址 */
    return m3u8.replace(/\n[^#\n]*\n/g, (str) => {
      return '\n' + host + str.replace(/\n/g, '') + '\n';
    });
  }).catch((err) => {
    console.error(err);
  });
}

/**
 * 保存m3u8
 * @param { string } title: 文件标题
 * @param { string } text : 保存的文本
 */
export function saveM3U8(title, text) {
  const p = path.join(option.output, `/${ title }.m3u8`).replace(/\\/g, '/');

  return new Promise((resolve, reject) => {
    fs.writeFile(p, text, {
      encoding: 'utf8',
      flag: 'w'
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(p);
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}