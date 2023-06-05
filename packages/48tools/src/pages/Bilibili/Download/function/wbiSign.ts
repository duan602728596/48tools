import { createHash, type Hash } from 'node:crypto';
import { requestInterfaceNav } from '../../services/download';
import type { NavInterface } from '../../services/interface';

/* md5加密 */
function md5(str: string): string {
  const md5Hash: Hash = createHash('md5');

  md5Hash.update(str);

  return md5Hash.digest( 'hex');
}

const mixinKeyEncTab: Array<number> = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
];

function getMixinKey(orig: string): string {
  let temp: string = '';

  mixinKeyEncTab.forEach((n: number): void => {
    temp += orig[n];
  });

  return temp.slice(0, 32);
}

function encWbi(params: Record<string, string>, img_key: string, sub_key: string): string {
  const mixin_key: string = getMixinKey(img_key + sub_key),
    curr_time: number = Math.round(Date.now() / 1000),
    chr_filter: RegExp = /[!'\(\)*]/g;

  const query: Array<string> = [];
  const params2: Record<string, string> = Object.assign(params, { wts: curr_time });

  Object.keys(params2).sort().forEach((key: string): void => {
    query.push(
      encodeURIComponent(key)
      + '='
      + encodeURIComponent(('' + params2[key]).replace(chr_filter, ''))
    );
  });

  const queryStr: string = query.join('&');
  const wbi_sign: string = md5(queryStr + mixin_key);

  return queryStr + '&w_rid=' + wbi_sign;
}

async function getWbiKeys(proxy: string | undefined): Promise<[string, string]> {
  const res: NavInterface = await requestInterfaceNav(proxy);
  const { img_url, sub_url }: NavInterface['data']['wbi_img'] = res.data.wbi_img;

  return [
    img_url.substring(img_url.lastIndexOf('/') + 1, img_url.length).split('.')[0],
    sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.length).split('.')[0]
  ];
}

export async function sign(q: Record<string, string>, proxy: string | undefined): Promise<string> {
  const [img_key, sub_key]: [string, string] = await getWbiKeys(proxy);

  return encWbi(q, img_key, sub_key);
}