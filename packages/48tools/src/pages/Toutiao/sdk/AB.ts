import loadScript from '../../../utils/loadScript';

let ABogus: any;

/**
 * 计算a_bogus
 * window.bdms.init._v[2].p[42](0, 1, 6, params, data, ua)
 * https://www.cnblogs.com/steed4ever/p/18167077
 * http://www.lxspider.com/?p=956
 */
export async function getABResult(params: string, data: string, ua: string): Promise<string> {
  if (!ABogus) {
    await loadScript(require('./bdms.js'), 'bdms');
    ABogus = globalThis.bdms.init._v[2].p[42];
  }

  return ABogus(0, 1, 6, params, data, ua);
}