import { randomUUID } from 'node:crypto';
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
import { Input, message, Modal, Select } from 'antd';
import { Onion } from '@bbkkbkk/q';
import type { UseMessageReturnType } from '@48tools-types/antd';
import style from './videoOrUserParse.sass';
import parseValueMiddleware from './middlewares/parseValueMiddleware';
import verifyMiddleware from './middlewares/verifyMiddleware';
import rendedDataMiddleware from './middlewares/rendedDataMiddleware';
import { setAddDownloadList } from '../../reducers/douyin';
import type { DownloadUrlItem } from '../../types';

/* select渲染 */
function selectOptionsRender(downloadUrl: Array<DownloadUrlItem>): Array<ReactNode> {
  return downloadUrl.map((item: DownloadUrlItem, index: number): ReactElement => {
    return <Select.Option key={ item.label + item.value } value={ item.value }>{ item.label }</Select.Option>;
  });
}

/* 视频或用户解析 */
function VideoOrUserParse(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [urlLoading, setUrlLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层的显示隐藏
  const [downloadUrl, setDownloadUrl]: [DownloadUrlItem[], D<S<DownloadUrlItem[]>>] = useState([]); // 视频下载地址
  const [selectedUrl, setSelectedUrl]: [string, D<S<string>>] = useState(''); // 选中的下载地址
  const [title, setTitle]: [string, D<S<string>>] = useState(''); // 视频标题

  // 添加新的下载地址
  function handleAddClick(event: MouseEvent): void {
    dispatch(setAddDownloadList({
      qid: randomUUID(),
      url: selectedUrl,
      title
    }));
    setVisible(false);
  }

  // 关闭后清除状态
  function afterClose(): void {
    setDownloadUrl([]);
    setSelectedUrl('');
    setTitle('');
  }

  // 解析视频地址
  function handleParseVideoOrUserSearch(value: string, event: ChangeEvent<HTMLInputElement>): void {
    if (/^\s*$/.test(value)) return;

    const onion: Onion = new Onion();

    onion.use(parseValueMiddleware);
    onion.use(verifyMiddleware);
    onion.use(rendedDataMiddleware);

    setUrlLoading(true);
    onion.run({
      value,
      messageApi,
      setUrlLoading,
      setVisible,
      setDownloadUrl,
      setTitle
    });
  }

  return (
    <Fragment>
      <Input.Search className={ style.input }
        enterButton="解析视频"
        placeholder="输入视频ID、用户ID或用户主页地址"
        loading={ urlLoading }
        onSearch={ handleParseVideoOrUserSearch }
      />
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

export default VideoOrUserParse;