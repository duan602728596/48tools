import { promises as fsP } from 'node:fs';
import * as path from 'node:path';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server.browser';
import * as HtmlComponents from '../SearchMessage/HTMLComponents';
import type { SendDataItem } from '../../types';

interface CreatePDFObject {
  data: Array<SendDataItem>; // 数据
  filePath: string;          // 根目录
  page: number;              // 索引
  length: number;            // 数据总数
  time: string;              // 文件创建时间
}

/* 生成PDF */
async function createHtml({ data, filePath, page, length, time }: CreatePDFObject): Promise<void> {
  // 创建组件
  const pdfComponents: Array<ReactElement> = [];

  data.forEach((item: SendDataItem, index: number): void => {
    try {
      if (item.msgType === 'TEXT') {
        pdfComponents.push(<HtmlComponents.Text key={ index } item={ item } />);
      } else if (item.msgType === 'REPLY') {
        pdfComponents.push(<HtmlComponents.Reply key={ index } item={ item } />);
      } else if (['IMAGE', 'VIDEO', 'AUDIO'].includes(item.msgType)) {
        pdfComponents.push(<HtmlComponents.Media key={ index } item={ item } />);
      } else if (item.msgType === 'LIVEPUSH') {
        pdfComponents.push(<HtmlComponents.LivePush key={ index } item={ item } />);
      } else if (item.msgType === 'FLIPCARD') {
        pdfComponents.push(<HtmlComponents.FlipCard key={ index } item={ item } />);
      } else if (item.msgType === 'FLIPCARD_AUDIO' || item.msgType === 'FLIPCARD_VIDEO' ) {
        pdfComponents.push(<HtmlComponents.FlipMedia key={ index } item={ item } />);
      } else if (item.msgType === 'EXPRESSIMAGE') {
        pdfComponents.push(<HtmlComponents.ExpressImage key={ index } item={ item } />);
      } else {
        pdfComponents.push(<HtmlComponents.JSONComponent key={ index } item={ item } />);
      }
    } catch (err) {
      console.error(err, item);
      pdfComponents.push(<HtmlComponents.ErrorJSONComponent key={ index } item={ item } />);
    }
  });

  const htmlPath: string = path.join(filePath, `${ page }.html`);

  await fsP.writeFile(htmlPath, `<!--
  Created by 48tools at ${ time }.
  https://github.com/duan602728596/48tools

  Generated using React and Primer design.
    - https://github.com/facebook/react
    - https://primer.style/
-->\n${
  renderToString(<HtmlComponents.Html time={ time } page={ page } length={ length }>{ pdfComponents }</HtmlComponents.Html>)
}`, { encoding: 'utf8' });
}

export default createHtml;