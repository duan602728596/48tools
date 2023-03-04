import { promises as fsP } from 'node:fs';
import * as path from 'node:path';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server.browser';
import * as dayjs from 'dayjs';
import * as PDFComponents from '../SearchMessage/StaticHtml/HTMLComponents';
import type { SendDataItem } from '../../types';

interface CreatePDFObject {
  data: Array<SendDataItem>; // 数据
  filePath: string; // 根目录
  k: number; // 索引
}

/* 生成PDF */
async function createHtml({ data, filePath, k }: CreatePDFObject): Promise<void> {
  // 创建组件
  const pdfComponents: Array<ReactElement> = [];

  data.forEach((item: SendDataItem, index: number): void => {
    try {
      if (item.msgType === 'TEXT') {
        pdfComponents.push(<PDFComponents.Text key={ index } item={ item } />);
      } else if (item.msgType === 'REPLY') {
        pdfComponents.push(<PDFComponents.Reply key={ index } item={ item } />);
      } else if (['IMAGE', 'VIDEO', 'AUDIO'].includes(item.msgType)) {
        pdfComponents.push(<PDFComponents.Media key={ index } item={ item } />);
      } else if (item.msgType === 'LIVEPUSH') {
        pdfComponents.push(<PDFComponents.LivePush key={ index } item={ item } />);
      } else if (item.msgType === 'FLIPCARD') {
        pdfComponents.push(<PDFComponents.FlipCard key={ index } item={ item } />);
      } else if (item.msgType === 'FLIPCARD_AUDIO' || item.msgType === 'FLIPCARD_VIDEO' ) {
        pdfComponents.push(<PDFComponents.FlipMedia key={ index } item={ item } />);
      } else if (item.msgType === 'EXPRESSIMAGE') {
        pdfComponents.push(<PDFComponents.ExpressImage key={ index } item={ item } />);
      } else {
        pdfComponents.push(<PDFComponents.JSONComponent key={ index } item={ item } />);
      }
    } catch (err) {
      console.error(err, item);
      pdfComponents.push(<PDFComponents.ErrorJSONComponent key={ index } item={ item } />);
    }
  });

  const time: string = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const html: string = renderToString(
    <html>
      <head>
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="https://unpkg.com/@primer/css@20.8.3/dist/primer.css" />
        <style>
          {`.template-image { max-width: 400px; max-height: 400px; }
.template-image-express-image { max-width: 85px; }
.template-code { white-space: pre-line; word-break: break-all; }`}
        </style>
      </head>
      <body className="p-4 f5">
        <header className="mb-2 f6 flash flash-warn">
          Created by&nbsp;
          <a href="https://github.com/duan602728596/48tools" target="_blank" rel="noreferrer">48tools</a>
          &nbsp;at { time }.
        </header>
        { pdfComponents }
      </body>
    </html>
  );

  const htmlPath: string = path.join(filePath, `${ k }.html`);

  await fsP.writeFile(htmlPath, `<!--
Created by 48tools at ${ time }.
https://github.com/duan602728596/48tools
-->\n${ html }`, { encoding: 'utf8' });
}

export default createHtml;