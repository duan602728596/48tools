import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import { ipcRenderer } from 'electron';
import {
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type ChangeEvent,
  type MouseEvent
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Input, Button, Modal, message, Select } from 'antd';
import { Onion } from '@bbkkbkk/q';
import style from './add.sass';
import { requestDouyinVideoHtml, type DouyinVideo } from '../services/douyin';
import { setAddDownloadList } from '../reducers/douyin';
import douyinCookieCache from './DouyinCookieCache';
import type { UseMessageReturnType } from '../../../commonTypes';
import type {
  AwemeDetail,
  ScriptRendedData,
  DownloadUrlItem,
  C0Obj,
  CVersionObj,
  GetVideoUrlOnionContext,
  VerifyData
} from '../types';

/* select渲染 */
function selectOptionsRender(downloadUrl: Array<DownloadUrlItem>): Array<ReactNode> {
  return downloadUrl.map((item: DownloadUrlItem, index: number): ReactElement => {
    return <Select.Option key={ item.label + item.value } value={ item.value }>{ item.label }</Select.Option>;
  });
}

/* 获取和下载链接 */
function Add(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [urlValue, setUrlValue]: [string, D<S<string>>] = useState('');
  const [getUrlLoading, setGetUrlLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层的显示隐藏
  const [downloadUrl, setDownloadUrl]: [DownloadUrlItem[], D<S<DownloadUrlItem[]>>] = useState([]); // 视频下载地址
  const [selectedUrl, setSelectedUrl]: [string, D<S<string>>] = useState(''); // 选中的下载地址
  const [title, setTitle]: [string, D<S<string>>] = useState(''); // 视频标题

  // 关闭后清除状态
  function afterClose(): void {
    setDownloadUrl([]);
    setSelectedUrl('');
    setTitle('');
  }

  // 添加新的下载地址
  function handleAddClick(event: MouseEvent): void {
    dispatch(setAddDownloadList({
      qid: randomUUID(),
      url: selectedUrl,
      title
    }));
    setVisible(false);
  }

  // 获取下载地址
  function handleGetVideoUrlClick(event: MouseEvent): void {
    if (/^\s*$/.test(urlValue)) return;

    setGetUrlLoading(true);

    try {
      const onion: Onion = new Onion();

      // 请求html
      onion.use(async function(ctx: GetVideoUrlOnionContext, next: Function): Promise<void> {
        let html: string = '';
        let douyinFirstResCookie: string | undefined = undefined;

        douyinCookieCache.getCookie((c: string): unknown => douyinFirstResCookie = c); // 取缓存的cookie

        const douyinFirstRes: DouyinVideo = await requestDouyinVideoHtml(urlValue, douyinFirstResCookie); // 获取__ac_nonce

        if (douyinFirstRes.type === 'html') {
          // 直接获取html
          html = douyinFirstRes.value;
        } else {
          // 计算__ac_signature并获取html
          const acSignature: string = Reflect.get(Reflect.get(globalThis, 'byted_acrawler'), 'sign')
            .call(undefined, '', douyinFirstRes.value);
          const douyinAcCookie: string = `__ac_nonce=${ douyinFirstRes.value }; __ac_signature=${ acSignature };`;
          const douyinSecondRes: DouyinVideo = await requestDouyinVideoHtml(urlValue, douyinAcCookie);

          ctx.cookie = douyinAcCookie;
          html = douyinSecondRes.value;
        }

        ctx.html = html;
        next();
      });

      // 分析验证码消息
      onion.use(async function(ctx: GetVideoUrlOnionContext, next: Function): Promise<void> {
        if (ctx.html && ctx.html.includes('验证码中间页')) {
          const verifyDataArr: string[] = ctx.html.split(/\n/);
          const verifyData: string | undefined = verifyDataArr.find(
            (o: string): boolean => /const\s+verify_data\s+=\s+/i.test(o));

          if (verifyData) {
            const verifyDataJson: VerifyData = JSON.parse(
              verifyData.replace(/const\s+verify_data\s+=\s+/i, ''));

            ctx.fp = verifyDataJson.fp;
            ipcRenderer.send('toutiao-fp', verifyDataJson.fp); // 将fp发送到主线程
            await setTimeout(2_000);
            globalThis.TTGCaptcha.init({
              commonOptions: {
                aid: 6383,
                iid: '0',
                did: '0'
              },
              captchaOptions: {
                hideCloseBtn: true,
                showMode: 'mask',
                async successCb(): Promise<void> {
                  const douyinCompleteCookie: string = `${ ctx.cookie! } s_v_web_id=${ ctx.fp! };`; // 需要的完整的cookie
                  const douyinHtmlRes: DouyinVideo = await requestDouyinVideoHtml(urlValue, douyinCompleteCookie);

                  douyinCookieCache.setCookie(douyinCompleteCookie);
                  ctx.html = douyinHtmlRes.value;
                  next();
                }
              }
            });
            globalThis.TTGCaptcha.render({ verify_data: verifyDataJson });

            return;
          }
        }

        next();
      });

      // 解析dom
      onion.use(function(ctx: GetVideoUrlOnionContext, next: Function): void {
        const parseDocument: Document = new DOMParser().parseFromString(ctx.html!, 'text/html');
        const rendedData: HTMLElement | null = parseDocument.getElementById('RENDER_DATA');

        if (rendedData) {
          const data: string = decodeURIComponent(rendedData.innerText);
          const json: ScriptRendedData = JSON.parse(data);
          const cVersion: CVersionObj | undefined = Object.values(json).find(
            (o: C0Obj | CVersionObj): o is CVersionObj => typeof o === 'object' && ('aweme' in o));

          if (cVersion) {
            const awemeDetail: AwemeDetail = cVersion.aweme.detail;
            const urls: DownloadUrlItem[] = [];

            urls.push({ label: '无水印', value: `https:${ awemeDetail.video.playApi }` });

            let i: number = 1;

            for (const item of awemeDetail.video.bitRateList) {
              for (const item2 of item.playAddr) {
                urls.push({
                  label: '下载地址-' + i++,
                  value: `https:${ item2.src }`
                });
              }
            }

            setDownloadUrl(urls);
            setTitle(awemeDetail.desc);
            setVisible(true);
          } else {
            messageApi.error('视频相关信息解析失败！');
          }
        } else {
          messageApi.error('找不到视频相关信息！');
        }

        next();
      });

      onion.use(function(ctx: GetVideoUrlOnionContext, next: Function): void {
        setGetUrlLoading(false);
        next();
      });

      onion.run();
    } catch (err) {
      console.error(err);
      messageApi.error('视频地址解析失败！');
      setGetUrlLoading(false);
    }
  }

  // 清除抖音的cookie
  function handleClearDouyinCookie(event: MouseEvent): void {
    douyinCookieCache.clearCookie();
    messageApi.success('Cookie已清除！');
  }

  return (
    <Fragment>
      <Input className={ style.input }
        value={ urlValue }
        placeholder="请输入视频ID"
        onChange={ (event: ChangeEvent<HTMLInputElement>): void => setUrlValue(event.target.value) }
      />
      <Button.Group>
        <Button loading={ getUrlLoading } onClick={ handleGetVideoUrlClick }>获取下载地址</Button>
        <Button type="primary" danger={ true } onClick={ handleClearDouyinCookie }>清除抖音Cookie的缓存</Button>
      </Button.Group>
      {/* 下载地址 */}
      <Modal title="选择下载地址"
        open={ visible }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        afterClose={ afterClose }
        onOk={ handleAddClick }
        onCancel={ (event: MouseEvent): void => setVisible(false) }
      >
        <Select className={ style.urlSelect }
          value={ selectedUrl }
          onSelect={ (value: string): void => setSelectedUrl(value) }
        >
          { selectOptionsRender(downloadUrl) }
        </Select>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default Add;