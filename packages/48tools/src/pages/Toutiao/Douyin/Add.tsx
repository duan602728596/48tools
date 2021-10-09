import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  ReactElement,
  ReactNodeArray,
  Dispatch as D,
  SetStateAction as S,
  ChangeEvent,
  MouseEvent
} from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Input, Button, Modal, message, Select } from 'antd';
import style from './add.sass';
import { requestDouyinVideoHtml, DouyinVideo } from '../services/douyin';
import { setAddDownloadList } from '../reducers/douyin';
import type { AwemeDetail, ScriptRendedData, DownloadUrlItem, C0Obj, CVersionObj } from '../types';

/* select渲染 */
function selectOptionsRender(downloadUrl: Array<DownloadUrlItem>): ReactNodeArray {
  return downloadUrl.map((item: DownloadUrlItem, index: number): ReactElement => {
    return <Select.Option key={ item.label + item.value } value={ item.value }>{ item.label }</Select.Option>;
  });
}

/* 获取和下载链接 */
function Add(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
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
  function handleAddClick(event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setAddDownloadList({
      qid: randomUUID(),
      url: selectedUrl,
      title
    }));
    setVisible(false);
  }

  // 获取下载地址
  async function handleGetVideoUrlClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    if (/^\s*$/.test(urlValue)) return;

    setGetUrlLoading(true);

    try {
      let html: string = '';
      const res: DouyinVideo = await requestDouyinVideoHtml(urlValue);

      if (res.type === 'html') {
        // 直接获取html
        html = res.value;
      } else {
        // 计算__ac_signature并获取html
        const acSignature: string = Reflect.get(Reflect.get(globalThis, 'byted_acrawler'), 'sign')
          .call(undefined, '', res.value);
        const secondCookie: string = ` __ac_nonce=${ res.value }; __ac_signature=${ acSignature }`;
        const secondRes: DouyinVideo = await requestDouyinVideoHtml(urlValue, secondCookie);

        html = secondRes.value;
      }

      const document: Document = new DOMParser().parseFromString(html, 'text/html');
      const rendedData: HTMLElement | null = document.getElementById('RENDER_DATA');

      if (rendedData) {
        const data: string = decodeURIComponent(rendedData.innerText);
        const json: ScriptRendedData = JSON.parse(data);
        const cVersion: CVersionObj | undefined = Object.values(json).find(
          (o: C0Obj | CVersionObj): o is CVersionObj => typeof o === 'object' && ('aweme' in o));

        if (cVersion) {
          const awemeDetail: AwemeDetail = cVersion.aweme.detail;
          const urls: DownloadUrlItem[] = [];

          urls.push(
            { label: '有水印', value: awemeDetail.download.url },
            { label: '无水印', value: `https:${ awemeDetail.video.playApi }` }
          );

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
          message.error('找不到视频相关信息！');
        }
      } else {
        message.error('找不到视频相关信息！');
      }
    } catch (err) {
      console.error(err);
      message.error('视频地址解析失败！');
    }

    setGetUrlLoading(false);
  }

  return (
    <Fragment>
      <Input className={ style.input }
        value={ urlValue }
        placeholder="请输入视频ID"
        onChange={ (event: ChangeEvent<HTMLInputElement>): void => setUrlValue(event.target.value) }
      />
      <Button loading={ getUrlLoading } onClick={ handleGetVideoUrlClick }>获取下载地址</Button>
      {/* 下载地址 */}
      <Modal title="选择下载地址"
        visible={ visible }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        afterClose={ afterClose }
        onOk={ handleAddClick }
        onCancel={ (event: MouseEvent<HTMLButtonElement>): void => setVisible(false) }
      >
        <Select className={ style.urlSelect }
          value={ selectedUrl }
          onSelect={ (value: string): void => setSelectedUrl(value) }
        >
          { selectOptionsRender(downloadUrl) }
        </Select>
      </Modal>
    </Fragment>
  );
}

export default Add;