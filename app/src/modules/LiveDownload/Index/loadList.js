// @flow
import jQuery from 'jquery';
import cheerio from 'cheerio';

/**
 * 使用ajax加载列表
 * @param { string } group
 * @param { number } page
 */
export function loadList(group: string, page: number): Promise{
  return new Promise((resolve: Function, reject: Function): void=>{
    jQuery.ajax({
      url: `http://live.${ group.toLocaleLowerCase() }.com/Index/index/p/${ page }.html`,
      type: 'GET',
      dataType: 'text',
      async: true,
      success: function(result: any, status: number, xhr: any): void{
        resolve(result);
      }
    });
  });
}

/**
 * 解析html
 * @param { string } html
 */
export function queryHtml(html: string): Object{
  const xml: any = cheerio.load(html);
  const pageLen: number = Number(xml('.p-skip').text().match(/[0-9]+/g)[0]);
  const videoList: any = xml('.videos');
  const result: Array = [];
  videoList.map((index: number, element: any): void=>{
    const item: any = xml(element);
    const href: string = item.find('a').attr('href');
    const h4: string = item.find('h4').text();
    const p: string = item.find('p').text();
    const id: Array = href.split('/');
    result.push({
      id: id[id.length - 1],
      title: h4,
      secondTitle: p
    });
  });
  return {
    result,
    pageLen: pageLen
  };
}