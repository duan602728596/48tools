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
import { Input, message, Modal, Select, Table, Button } from 'antd';
import type { BaseOptionType } from 'rc-select/es/Select';
import type { ColumnsType } from 'antd/es/table';
import { Onion } from '@bbkkbkk/q';
import type { UseMessageReturnType } from '@48tools-types/antd';
import style from './videoOrUserParse.sass';
import parseValueMiddleware from './middlewares/parseValueMiddleware';
import verifyMiddleware from './middlewares/verifyMiddleware';
import rendedDataMiddleware from './middlewares/rendedDataMiddleware';
import { setAddDownloadList } from '../../reducers/douyin';
import type { DownloadUrlItem, UserDataItem, VideoInfoItem } from '../../types';

/* select渲染 */
function selectOptionsRender(downloadUrl: Array<DownloadUrlItem>): Array<ReactElement> {
  return downloadUrl.map((item: DownloadUrlItem, index: number): ReactElement => {
    return <Select.Option key={ item.label + item.value } value={ item.value } item={ item }>{ item.label }</Select.Option>;
  });
}

/* userData select渲染 */
function userDataSelectOptionsRender(video: VideoInfoItem): Array<ReactElement> {
  const element: Array<ReactElement> = [];
  const noWatchMarkValue: string = `https:${ video.playApi }`;

  element.push(
    <Select.Option key={ '无水印' + noWatchMarkValue }
      value={ noWatchMarkValue }
      item={{ label: '无水印', value: noWatchMarkValue }}
      alert={ true }
    >
      无水印
    </Select.Option>
  );

  let i: number = 1;

  for (const bitRate of video.bitRateList) {
    for (const addr of bitRate.playAddr) {
      const labelText: string = `下载地址-${ i++ }(${ bitRate.width }*${ bitRate.height })`;
      const value: string = `https:${ addr.src }`;

      element.push(
        <Select.Option key={ labelText + value } value={ value } item={{
          label: labelText,
          value,
          width: bitRate.width,
          height: bitRate.height
        }}>
          { labelText }
        </Select.Option>
      );
    }
  }

  return element;
}

/* 视频或用户解析 */
function VideoOrUserParse(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [urlLoading, setUrlLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 单个视频下载
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层的显示隐藏
  const [downloadUrl, setDownloadUrl]: [DownloadUrlItem[], D<S<DownloadUrlItem[]>>] = useState([]); // 视频下载地址
  const [selectedUrl, setSelectedUrl]: [DownloadUrlItem | undefined, D<S<DownloadUrlItem | undefined>>]
    = useState(undefined); // 选中的下载地址
  const [title, setTitle]: [string, D<S<string>>] = useState(''); // 视频标题

  // 用户视频列表
  const [userModalVisible, setUserModalVisible]: [boolean, D<S<boolean>>] = useState(false); // 多个视频下载的弹出层的显示隐藏
  const [userVideoList, setUserVideoList]: [Array<UserDataItem>, D<S<UserDataItem[]>>] = useState([]); // 用户视频列表
  const [videoCursor, setVideoCursor]: [number | undefined, D<S<undefined>>] = useState(undefined); // 加载下一页时用
  const [userTitle, setUserTitle]: [string, D<S<string>>] = useState('');

  // 添加新的下载地址
  function handleAddClick(event: MouseEvent): void {
    if (selectedUrl) {
      dispatch(setAddDownloadList({
        qid: randomUUID(),
        url: selectedUrl.value,
        title,
        width: selectedUrl.width,
        height: selectedUrl.height
      }));
    }

    setVisible(false);
  }

  // 选择下载地址
  function handleUserListDownloadUrlSelect(
    record: UserDataItem,
    value: string,
    option: { item: DownloadUrlItem } & BaseOptionType
  ): void {
    dispatch(setAddDownloadList({
      qid: randomUUID(),
      url: option.item.value,
      title: record.desc,
      width: option.item.width,
      height: option.item.height
    }));
    messageApi.info('添加到下载列表。');
  }

  // 选择下载地址
  function handleDownloadUrlSelect(value: string, option: { item: DownloadUrlItem } & BaseOptionType): void {
    setSelectedUrl(option.item);
  }

  // 关闭后清除状态
  function videoDownloadModalAfterClose(): void {
    setDownloadUrl([]);
    setSelectedUrl(undefined);
    setTitle('');
  }

  function userModalAfterClose(): void {
    setUserVideoList([]);
    setVideoCursor(undefined);
    setUserTitle('');
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
      setTitle,
      setUserModalVisible,
      setUserVideoList,
      setVideoCursor,
      setUserTitle
    });
  }

  const columns: ColumnsType<UserDataItem> = [
    { title: '视频标题', dataIndex: 'desc' },
    {
      title: '操作',
      key: 'action',
      render: (value: undefined, record: UserDataItem, index: number): ReactNode => (
        <Select className={ style.userListUrlSelect }
          size="small"
          onSelect={ (v: string, option: { item: DownloadUrlItem } & BaseOptionType): void =>
            handleUserListDownloadUrlSelect(record, v, option) }
        >
          { userDataSelectOptionsRender(record.video) }
        </Select>
      )
    }
  ];

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
        maskClosable={ false }
        afterClose={ videoDownloadModalAfterClose }
        onOk={ handleAddClick }
        onCancel={ (event: MouseEvent): void => setVisible(false) }
      >
        <Select className={ style.urlSelect }
          value={ selectedUrl }
          onSelect={ handleDownloadUrlSelect }
        >
          { selectOptionsRender(downloadUrl) }
        </Select>
      </Modal>
      {/* 用户视频列表 */}
      <Modal title={ userTitle }
        open={ userModalVisible }
        width={ 600 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        afterClose={ userModalAfterClose }
        okText="加载下一页视频"
        cancelText="关闭"
        onCancel={ (event: MouseEvent): void => setUserModalVisible(false) }
      >
        <div className="h-[370px] overflow-auto">
          <Table size="small"
            dataSource={ userVideoList }
            columns={ columns }
            rowKey="awemeId"
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
              showSizeChanger: false
            }}
          />
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default VideoOrUserParse;