'use idle';

import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import { promises as fsP } from 'node:fs';
import { setTimeout, clearTimeout } from 'node:timers';
import { clipboard, ipcRenderer, type SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  useTransition,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type TransitionStartFunction
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, message, Table, Select, Form, Space, Popconfirm, Modal, AutoComplete, Spin, type FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseModalReturnType, UseMessageReturnType } from '@48tools-types/antd';
import { LoadingOutlined as IconLoadingOutlined } from '@ant-design/icons';
import * as dayjs from 'dayjs';
import filenamify from 'filenamify/browser';
import { WinIpcChannel } from '@48tools/main/src/channelEnum';
import {
  requestLiveList,
  requestLiveRoomInfo,
  requestDownloadFileByStream,
  requestDownloadFile,
  type LiveData,
  type LiveInfo,
  type LiveRoomInfo
} from '@48tools-api/48';
import type { RoomItem } from '@48tools-api/48/jsdelivrCDN';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getRecordVideoDownloadWorker from './RecordVideoDownload.worker/getRecordVideoDownloadWorker';
import getFFmpegDownloadWorker from '../../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import Header from '../../../../components/Header/Header';
import {
  setRecordList,
  setAddRecordChildList,
  setDeleteRecordChildList,
  setRecordFields,
  setDownloadProgress,
  type Pocket48InitialState
} from '../../reducers/pocket48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import { engineUserAgent } from '../../../../utils/snh48';
import downloadImages from '../Pocket48Live/downloadImages/downloadImages';
import { getProxyServerPort, proxyServerInit } from '../../../../utils/proxyServer/proxyServer';
import { pick } from '../../../../utils/lodash';
import { ProgressNative, type ProgressSet } from '../../../../components/ProgressNative/index';
import { useReqRoomIdQuery, type ReqRoomId } from '../../reducers/pocketFriends.api';
import LiveType from '../../components/LiveType/LiveType';
import type { MessageEventData } from '../../../../utils/worker/FFmpegDownload.worker/FFmpegDownload.worker';
import type { RecordFieldData, RecordVideoDownloadWebWorkerItem } from '../../types';

const groupIdSelectOptions: Array<DefaultOptionType> = [
  { label: '全部', value: 'all' },
  { label: 'SNH48', value: 10 },
  { label: 'BEJ48', value: 11 },
  { label: 'GNZ48', value: 12 },
  { label: 'CKG48', value: 14 },
  { label: 'CGT48', value: 21 },
  { label: 'IDFT', value: 15 },
  { label: '明星殿堂', value: 19 },
  { label: 'THE9', value: 17 },
  { label: '硬糖少女303', value: 18 },
  { label: '丝芭影视', value: 20 },
  { label: '海外练习生', value: 16 }
];

/**
 * 格式化m3u8文件内视频的地址
 * @param { string } data - m3u8文件内容
 * @param { number } port - 代理的端口号
 */
export function formatTsUrl(data: string, port: number): string {
  const dataArr: string[] = data.split('\n');
  const newStrArr: string[] = [];

  for (const item of dataArr) {
    if (/^\/fragments.*\.ts$/.test(item)) {
      const tsUrl: string = `https://cychengyuan-vod.48.cn${ item }`;

      newStrArr.push(`http://localhost:${ port }/proxy/cychengyuan-vod48?url=${ encodeURIComponent(tsUrl) }`);
    } else {
      newStrArr.push(item);
    }
  }

  return newStrArr.join('\n');
}

/* 搜索 */
let searchTimer: NodeJS.Timeout | null = null;

/* redux selector */
type RSelector = Pick<Pocket48InitialState, 'recordList' | 'recordNext' | 'recordChildList' | 'recordFields' | 'progress'>;
type RState = { pocket48: Pocket48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 录播信息
  recordList: ({ pocket48 }: RState): Array<LiveInfo> => pocket48.recordList,

  // 记录录播分页位置
  recordNext: ({ pocket48 }: RState): string => pocket48.recordNext,

  // 录播下载
  recordChildList: ({ pocket48 }: RState): Array<RecordVideoDownloadWebWorkerItem> => pocket48.recordChildList,

  // 表单field
  recordFields: ({ pocket48 }: RState): Array<RecordFieldData> => pocket48.recordFields,

  // 进度条列表
  progress: ({ pocket48 }: RState): Record<string, ProgressSet> => pocket48.progress
});

/* 录播列表 */
function Pocket48Record(props: {}): ReactElement {
  const { recordList, recordNext, recordChildList, recordFields, progress }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [modalApi, modalContextHolder]: UseModalReturnType = Modal.useModal();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [userIdSearchResult, setUserIdSearchResult]: [Array<DefaultOptionType>, D<S<Array<DefaultOptionType>>>] = useState([]);
  const [refreshLiveListLoading, startRefreshLiveListStartTransition]: [boolean, TransitionStartFunction] = useTransition();
  const [userIdSearchLoading, startUserIdSearchStartTransition]: [boolean, TransitionStartFunction] = useTransition();
  const [form]: [FormInstance] = Form.useForm();
  const reqRoomId: ReqRoomId = useReqRoomIdQuery(undefined);
  const roomId: Array<RoomItem> = reqRoomId.data ?? [];

  // 输入xox名字搜索
  function handleByContentSearch(value: string): void {
    if (searchTimer !== null) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }

    if (!value) {
      setUserIdSearchResult([]);

      return;
    }

    searchTimer = setTimeout((): void => startUserIdSearchStartTransition((): void => {
      const result: Array<DefaultOptionType> = [];

      if (/^[\u4E00-\u9FFF]+$/i.test(value)) {
        // 搜索中文
        const regexp: RegExp = new RegExp(value, 'i');

        for (const item of roomId) {
          if (regexp.test(item.ownerName)) {
            result.push({
              label: `${ item.ownerName }（${ item.id }）`,
              value: `${ item.id }`
            });
          }
        }
      } else if (/^\d+$/i.test(value)) {
        // 搜索ID
        const regexp: RegExp = new RegExp(value, 'i');

        for (const item of roomId) {
          if (regexp.test(`${ item.id }`)) {
            result.push({
              label: `${ item.ownerName }（${ item.id }）`,
              value: `${ item.id }`
            });
          }
        }
      } else if (/^[a-zA-Z\s]+$/i.test(value)) {
        // 搜索英文
        // 搜索ID
        const regexp: RegExp = new RegExp(value.replaceAll(' ', ''), 'i');

        for (const item of roomId) {
          if (item.pinyin && regexp.test(`${ item.pinyin.replaceAll(' ', '') }`)) {
            result.push({
              label: `${ item.ownerName }（${ item.id }）`,
              value: `${ item.id }`
            });
          }
        }
      }

      setUserIdSearchResult(result);
    }));
  }

  // 表单的onFieldsChange事件
  function handleFormFieldsChange(changedFields: RecordFieldData[], allFields: RecordFieldData[]): void {
    dispatch(setRecordFields(allFields));
  }

  // 停止
  function handleStopClick(record: LiveInfo, event?: MouseEvent): void {
    const index: number = recordChildList.findIndex((o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);

    if (index >= 0) {
      recordChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 重试（主要是下载ts碎片）
  function handleRetryDownloadClick(record: LiveInfo, event: MouseEvent): void {
    const index: number = recordChildList.findIndex((o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);

    if (index >= 0) {
      recordChildList[index].worker.postMessage({ type: 'retry' });
      messageApi.info('正在重新下载ts片段。');
    }
  }

  // 复制直播地址
  async function handleCopyLiveUrlClick(record: LiveInfo, event: MouseEvent): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    clipboard.writeText(resInfo.content.playStreamPath);
    messageApi.info('直播地址复制到剪贴板。');
  }

  // 打开新窗口播放视频
  function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent): void {
    const searchParams: URLSearchParams = new URLSearchParams(Object.assign(
      {
        id: record.liveId,    // rtmp服务器id
        playerType: 'record', // 'live' | 'record': 直播还是录播
        proxyPort: getProxyServerPort().port // 代理服务器端口号
      },
      pick(record, [
        'coverPath', // 头像
        'title',     // 直播间标题
        'liveId',    // 直播id
        'liveType',  // 直播类型
        'liveMode'
      ])
    ));

    ipcRenderer.send(WinIpcChannel.PlayerHtml, record.title, searchParams.toString());
  }

  // 下载图片
  async function handleDownloadImagesClick(record: LiveInfo, event: MouseEvent): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    downloadImages(modalApi, record, record.coverPath, resInfo.content?.carousels?.carousels);
  }

  /**
   * 下载视频
   * @param { LiveInfo } record
   * @param { 0 | 1 } downloadType - 下载方式。0：正常下载，1：拼碎片
   * @param { MouseEvent<HTMLButtonElement> } event
   */
  async function handleDownloadM3u8Click(record: LiveInfo, downloadType: 0 | 1, event: MouseEvent): Promise<void> {
    try {
      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const parseResult: ParsedPath = path.parse(resInfo.content.playStreamPath);
      const isM3u8: boolean = parseResult.ext === '.m3u8'; // 以前的视频可能是mp4的

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[口袋48录播]${ record.userInfo.nickname }_${ filenamify(record.title) }`
          + `@${ getFileTime(record.ctime) }__${ getFileTime() }${ isM3u8 ? '.ts' : parseResult.ext }`
      });

      if (result.canceled || !result.filePath) return;

      let downloadFile: string;

      if (isM3u8) {
        let m3u8File: string;

        if (downloadType === 1) {
          m3u8File = `${ result.filePath }.cache/_a.m3u8`;
          await fsP.mkdir(`${ result.filePath }.cache`);   // 生成缓存文件夹
        } else {
          m3u8File = `${ result.filePath }.m3u8`;
        }

        const m3u8Data: string = await requestDownloadFile(resInfo.content.playStreamPath, {
          'Host': 'cychengyuan-vod.48.cn',
          'User-Agent': engineUserAgent
        });

        await fsP.writeFile(m3u8File, formatTsUrl(m3u8Data, getProxyServerPort().port)); // 写入m3u8文件
        downloadFile = m3u8File; // m3u8文件地址
      } else {
        downloadFile = resInfo.content.playStreamPath;
      }

      let requestIdleID: number | null = null;
      const worker: Worker = (isM3u8 && downloadType === 1 ? getRecordVideoDownloadWorker : getFFmpegDownloadWorker)();

      worker.addEventListener('message', function(workerEvent: MessageEvent<MessageEventData>) {
        const { type }: MessageEventData = workerEvent.data;

        if (type === 'progress') {
          requestIdleID !== null && cancelIdleCallback(requestIdleID);
          requestIdleID = requestIdleCallback((): void => {
            dispatch(setDownloadProgress(workerEvent.data));
          });
        }

        if (type === 'close' || type === 'error') {
          requestIdleID !== null && cancelIdleCallback(requestIdleID);

          if (type === 'error') {
            messageApi.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteRecordChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: downloadFile,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        protocolWhitelist: isM3u8,
        qid: record.liveId
      });

      dispatch(setAddRecordChildList({
        id: record.liveId,
        worker,
        isM3u8,
        downloadType
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('录播下载失败！');
    }
  }

  // 下载弹幕
  async function handleDownloadLrcClick(record: LiveInfo, event: MouseEvent): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const time: string = getFileTime(record.ctime);

      if (res.content.msgFilePath === '') {
        messageApi.warning('弹幕文件不存在！');

        return;
      }

      const { ext }: ParsedPath = path.parse(res.content.msgFilePath);
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[口袋48弹幕]${ record.userInfo.nickname }_${ filenamify(record.title) }_${ time }${ ext }`
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(res.content.msgFilePath, result.filePath);
      messageApi.success('弹幕文件下载成功！');
    } catch (err) {
      messageApi.error('弹幕文件下载失败！');
      console.error(err);
    }
  }

  // 加载列表
  function handleLoadRecordListClick(event: MouseEvent): void {
    startRefreshLiveListStartTransition(async (): Promise<void> => {
      try {
        const { groupId, userId }: { groupId?: number | 'all'; userId?: string | number | undefined } = form.getFieldsValue();
        const res: LiveData = await requestLiveList(recordNext, false, groupId, userId);
        const data: Array<LiveInfo> = recordList.concat(res.content.liveList);

        dispatch(setRecordList({
          next: res.content.next,
          data
        }));
      } catch (err) {
        messageApi.error('录播列表加载失败！');
        console.error(err);
      }
    });
  }

  // 刷新列表
  function handleRefreshLiveListClick(event: MouseEvent): void {
    startRefreshLiveListStartTransition(async (): Promise<void> => {
      try {
        const { groupId, userId }: { groupId?: number | 'all'; userId?: string | number | undefined } = form.getFieldsValue();
        const res: LiveData = await requestLiveList('0', false, groupId, userId);

        dispatch(setRecordList({
          next: res.content.next,
          data: res.content.liveList
        }));
      } catch (err) {
        messageApi.error('录播列表加载失败！');
        console.error(err);
      }
    });
  }

  // 渲染分页
  function showTotalRender(total: number, range: [number, number]): ReactElement {
    return <Button size="small" onClick={ handleLoadRecordListClick }>加载列表</Button>;
  }

  const columns: ColumnsType<LiveInfo> = [
    { title: '标题', dataIndex: 'title' },
    { title: '成员', dataIndex: ['userInfo', 'nickname'] },
    {
      title: '类型',
      dataIndex: 'liveType',
      render: (value: 1 | 2, record: LiveInfo, index: number): ReactElement => <LiveType liveInfo={ record } />
    },
    {
      title: '时间',
      dataIndex: 'ctime',
      width: 165,
      render: (value: string, record: LiveInfo, index: number): string => {
        return dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '下载进度',
      dataIndex: 'liveId',
      render: (value: string, record: LiveInfo, index: number): ReactNode => {
        const inDownload: boolean = Object.hasOwn(progress, value);
        const idx: number = recordChildList.findIndex(
          (o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);

        if (inDownload) {
          return <ProgressNative progressSet={ progress[value] } />;
        } else {
          return idx >= 0 ? '准备中' : '未下载';
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 310,
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        const idx: number = recordChildList.findIndex(
          (o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);
        const item: RecordVideoDownloadWebWorkerItem | undefined = idx >= 0 ? recordChildList[idx] : undefined,
          canRetry: boolean | undefined = item && item.downloadType === 1;

        return (
          <Fragment>
            <div className="mb-[6px]">
              {
                idx >= 0 ? (
                  <Button.Group>
                    <Popconfirm title="确定要停止下载吗？"
                      onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
                    >
                      <Button type="primary" danger={ true }>停止下载</Button>
                    </Popconfirm>
                    {
                      canRetry && (
                        <Button onClick={
                          (event: MouseEvent): void => handleRetryDownloadClick(record, event)
                        }>
                          重试
                        </Button>
                      )
                    }
                  </Button.Group>
                ) : (
                  <Button.Group>
                    <Button onClick={
                      (event: MouseEvent): Promise<void> =>
                        handleDownloadM3u8Click(record, 0, event)
                    }>
                      下载视频
                    </Button>
                    <Button onClick={ (event: MouseEvent): Promise<void> => handleDownloadM3u8Click(record, 1, event) }>
                      备用方案下载
                    </Button>
                  </Button.Group>
                )
              }
            </div>
            <Button.Group size="small">
              <Button onClick={ (event: MouseEvent): Promise<void> => handleDownloadLrcClick(record, event) }>
                下载弹幕
              </Button>
              <Button onClick={ (event: MouseEvent): Promise<void> => handleDownloadImagesClick(record, event) }>
                下载图片
              </Button>
              <Button onClick={ (event: MouseEvent): void => handleOpenPlayerClick(record, event) }>
                播放
              </Button>
              <Button onClick={ (event: MouseEvent): Promise<void> => handleCopyLiveUrlClick(record, event) }>
                复制录播地址
              </Button>
            </Button.Group>
          </Fragment>
        );
      }
    }
  ];

  useEffect(function(): void {
    proxyServerInit();
  }, []);

  return (
    <Fragment>
      <Header>
        {/* 队伍和当前人的搜索 */}
        <Form className="inline-block" form={ form } fields={ recordFields } onFieldsChange={ handleFormFieldsChange }>
          <Space size={ 0 }>
            <div className="relative inline-block mr-[8px] align-super">
              <Space.Compact>
                <Form.Item name="groupId" noStyle={ true }>
                  <Select className="w-[130px]" options={ groupIdSelectOptions } />
                </Form.Item>
                <Form.Item name="userId" noStyle={ true }>
                  <AutoComplete className="w-[250px]"
                    placeholder="搜索支持姓名、ID、拼音"
                    onSearch={ handleByContentSearch }
                    options={ userIdSearchResult }
                  />
                </Form.Item>
              </Space.Compact>
              <div className="absolute z-10 top-[4px] right-[6px] pointer-events-none">
                { userIdSearchLoading && <Spin size="small" indicator={ <IconLoadingOutlined spin={ true } /> } /> }
              </div>
            </div>
            <Button.Group>
              <Button type="primary" onClick={ handleLoadRecordListClick }>加载列表</Button>
              <Button onClick={ handleRefreshLiveListClick }>刷新列表</Button>
            </Button.Group>
          </Space>
        </Form>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ recordList }
        bordered={ true }
        loading={ refreshLiveListLoading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true,
          showTotal: showTotalRender
        }}
      />
      { modalContextHolder }
      { messageContextHolder }
    </Fragment>
  );
}

export default Pocket48Record;