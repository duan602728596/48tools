import { getProxyServerPort } from '../../../../utils/proxyServer/proxyServer';

/**
 * 格式化m3u8文件内视频的地址
 * @param { string } data - m3u8文件内容
 * @param { string } m3u8Url - m3u8文件的路径
 */
export function formatTsUrl(data: string, m3u8Url: string): [string, Array<string>] {
  const port: number = getProxyServerPort().port;
  const dataArr: string[] = data.split('\n');
  const newStrArr: string[] = [];

  // m3u8文件所在的文件夹
  const m3u8Pathname: string = m3u8Url.split(/\?/)[0].replace(/\/[^/]+$/, '');

  for (const item of dataArr) {
    if (/^#/.test(item) || item === '') {
      newStrArr.push(item);
    } else if (/^\//.test(item)) {
      const tsUrl: string = `https://ts.48.cn${ item }`;

      // TODO: 尝试使用原始地址下载
      // newStrArr.push(`http://localhost:${ port }/proxy/ts48?url=${ encodeURIComponent(tsUrl) }`);
      newStrArr.push(tsUrl);
    } else {
      const tsUrl: string = `${ m3u8Pathname }/${ item }`;

      // TODO: 尝试使用原始地址下载
      // newStrArr.push(`http://localhost:${ port }/proxy/ts48?url=${ encodeURIComponent(tsUrl) }`);
      newStrArr.push(tsUrl);
    }
  }

  return [
    newStrArr.join('\n'),
    newStrArr.filter((item: string): boolean => !(/^#/.test(item) || item === ''))
  ];
}

/* 返回团ID */
export function getTeamId(teamName: string | undefined): number | undefined {
  switch (teamName) {
    case 'snh48':
      return 10;

    case 'bej48':
      return 11;

    case 'gnz48':
      return 12;

    case 'ckg48':
      return 14;

    case 'cgt48':
      return 21;

    default:
      return undefined;
  }
}