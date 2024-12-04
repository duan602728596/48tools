import { setTimeout, clearTimeout } from 'node:timers';
import { randomUUID } from 'node:crypto';
import type { SaveDialogReturnValue, OpenDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useMemo,
  useEffect,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, message, Popconfirm, Table, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { MessageInstance } from 'antd/es/message/interface';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import classNames from 'classnames';
import {
  requestServerJump,
  requestServerSearch,
  requestVoiceOperate,
  type ServerSearchResult,
  type ServerApiItem,
  type ServerJumpResult,
  type VoiceOperate
} from '@48tools-api/48';
import { showSaveDialog, showOpenDialog } from '../../../utils/remote/dialog';
import commonStyle from '../../../common.sass';
import Header from '../../../components/Header/Header';
import Pocket48Login from '../../../functionalComponents/Pocket48Login/Pocket48Login';
import FixSelect from '../components/FixSelect/FixSelect';
import {
  IDBCursorRoomVoiceInfo,
  IDBSaveRoomVoiceInfo,
  IDBUpdateRoomVoiceInfo,
  IDBDeleteRoomVoiceInfo,
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  setAutoRecord,
  roomVoiceListSelectors,
  type RoomVoiceInitialState
} from '../reducers/roomVoice';
import dbConfig from '../../../utils/IDB/IDBConfig';
import { getFFmpeg, getFilePath } from '../../../utils/utils';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import { startAutoRecord, stopAutoRecord } from './function/autoRecord';
import type { RoomVoiceItem } from '../types';
import type { WebWorkerChildItem, MessageEventData } from '../../../commonTypes';

let serverSearchTimer: NodeJS.Timeout | null = null; // 搜索

/* redux selector */
type RSelector = Pick<RoomVoiceInitialState, 'roomVoice' | 'autoRecordTimer'> & {
  roomVoiceWorkerList: Array<WebWorkerChildItem>;
  roomVoiceAutoRecordLength: number;
};
type RState = { roomVoice: RoomVoiceInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 正在下载
  roomVoiceWorkerList: ({ roomVoice }: RState): Array<WebWorkerChildItem> => roomVoiceListSelectors.selectAll(roomVoice),

  // 数据库保存的数据
  roomVoice: ({ roomVoice }: RState): Array<RoomVoiceItem> => roomVoice.roomVoice,

  // 允许自动录制的人数
  roomVoiceAutoRecordLength: ({ roomVoice }: RState): number => {
    const list: Array<RoomVoiceItem> = roomVoice.roomVoice.filter((o: RoomVoiceItem): boolean => !!o.autoRecord);

    return list.length;
  },

  // 自动录制
  autoRecordTimer: ({ roomVoice }: RState): number | null => roomVoice.autoRecordTimer
});

/* 口袋房间电台 */
function Voice(props: {}): ReactElement {
  const { roomVoice, roomVoiceWorkerList, roomVoiceAutoRecordLength, autoRecordTimer }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [searchLoading, setSearchLoading]: [boolean, D<S<boolean>>] = useState(false); // 搜索的loading状态
  const [searchResult, setSearchResult]: [Array<ServerApiItem>, D<S<ServerApiItem[]>>] = useState([]); // 搜索结果
  const [searchValue, setSearchValue]: [DefaultOptionType | undefined, D<S<DefaultOptionType | undefined>>]
    = useState(undefined);

  // 停止自动录制
  function handleStopAutoRecordClick(event: MouseEvent): void {
    stopAutoRecord();
  }

  // 开始自动录制
  async function handleStartAutoRecordClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    const args: [MessageInstance, string] = [messageApi, result.filePaths[0]];

    messageApi.info('开始自动抓取。');
    (await startAutoRecord(...args)) && dispatch(setAutoRecord(
      window.setInterval(startAutoRecord, 3 * 60_000, ...args)
    ));
  }

  // 删除serverId和channelId
  function handleDeleteServerIdClick(record: RoomVoiceItem, event: MouseEvent): void {
    dispatch(IDBDeleteRoomVoiceInfo({
      query: record.id
    }));
  }

  // 停止
  function handleStopClick(record: RoomVoiceItem, event?: MouseEvent): void {
    const index: number = roomVoiceWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      roomVoiceWorkerList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始录制
  async function handleRecordClick(record: RoomVoiceItem, event: MouseEvent): Promise<void> {
    try {
      const res: VoiceOperate | undefined = await requestVoiceOperate(record.serverId, record.channelId);

      if (res === undefined) {
        messageApi.error('请求失败！请先登录。');

        return;
      } else if (res?.content?.streamUrl === undefined) {
        messageApi.warning('房间电台未开启！');

        return;
      }

      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: getFilePath({
          typeTitle: '口袋48房间电台',
          infoArray: [record.nickname, record.serverId, record.channelId],
          ext: 'ts'
        })
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`口袋48房间电台${ record.nickname }录制失败！`);
          }

          worker.terminate();
          dispatch(setRemoveDownloadWorker(record.id));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: res.content.streamUrl,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddDownloadWorker({
        id: record.id,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('录制失败！');
    }
  }

  // 渲染searchServerResult
  const serverResultOptions: Array<DefaultOptionType> = useMemo(function(): Array<DefaultOptionType> {
    return searchResult.map((o: ServerApiItem): DefaultOptionType => ({
      label: o.serverDefaultName,
      value: `${ o.serverOwner }`
    }));
  }, [searchResult]);

  // 保存serverId和channelId，不需要每次搜索才能使用
  async function handleSaveClick(event: MouseEvent): Promise<void> {
    if (!searchValue) return;

    const item: RoomVoiceItem | undefined = roomVoice.find(
      (o: RoomVoiceItem): boolean => `${ o.serverId }` === searchValue.value);

    if (item) return;

    const jumpRes: ServerJumpResult | undefined = await requestServerJump(Number(searchValue.value));

    if (jumpRes) {
      dispatch(IDBSaveRoomVoiceInfo({
        data: {
          id: randomUUID(),
          channelId: jumpRes.content.channelId,
          serverId: jumpRes.content.serverId,
          nickname: searchValue.label
        }
      }));
      messageApi.success('保存成功！');
    }
  }

  // 选择一个房间
  function handleOwnerSelect(value: string, option: DefaultOptionType): void {
    setSearchValue({
      label: option.label,
      value: option.value
    });
  }

  // 搜索
  function handleServerSearch(value: string): void {
    if (serverSearchTimer !== null) {
      clearTimeout(serverSearchTimer);
      serverSearchTimer = null;
    }

    if (!(value && /[\u4E00-\u9FFF]+/.test(value))) {
      setSearchLoading(false);

      return;
    }

    setSearchLoading(true);
    serverSearchTimer = setTimeout(async (): Promise<void> => {
      const res: ServerSearchResult | undefined = await requestServerSearch(value);

      if (res?.content?.serverApiList?.length) {
        setSearchResult(res.content.serverApiList);
      }

      setSearchLoading(false);
    });
  }

  // 修改自动录制的checkbox
  function handleAutoRecordCheck(record: RoomVoiceItem, event: CheckboxChangeEvent): void {
    dispatch(IDBUpdateRoomVoiceInfo({
      data: { ...record, autoRecord: event.target.checked }
    }));
  }

  const columns: ColumnsType<RoomVoiceItem> = [
    { title: '姓名', dataIndex: 'nickname', width: '20%' },
    { title: 'serverId', dataIndex: 'serverId', width: '20%' },
    { title: 'channelId', dataIndex: 'channelId', width: '20%' },
    {
      title: '自动录制',
      dataIndex: 'autoRecord',
      width: '15%',
      render: (value: boolean, record: RoomVoiceItem, index: number): ReactElement => (
        <Checkbox checked={ value }
          disabled={ typeof autoRecordTimer === 'number' || (!record.autoRecord && roomVoiceAutoRecordLength >= 5) }
          onChange={ (event: CheckboxChangeEvent): void => handleAutoRecordCheck(record, event) }
        />
      )
    },
    {
      title: '操作',
      key: 'handle',
      width: '25%',
      render: (value: undefined, record: RoomVoiceItem, index: number): ReactElement => {
        const idx: number = roomVoiceWorkerList.findIndex((o: WebWorkerChildItem) => o.id === record.id);

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止录制吗？"
                  onConfirm={ (event?: MouseEvent ): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止录制</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent ): Promise<void> => handleRecordClick(record, event) }>
                  开始录制
                </Button>
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ idx >= 0 }
              onClick={ (event: MouseEvent): void => handleDeleteServerIdClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(IDBCursorRoomVoiceInfo({
      query: { indexName: dbConfig.objectStore[5].data[0] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <FixSelect value={ searchValue }
          loading={ searchLoading }
          options={ serverResultOptions }
          placeholder="输入成员名字搜索"
          onSearch={ handleServerSearch }
          onSelect={ handleOwnerSelect }
        />
        <Button.Group className="mx-[8px]">
          <Button onClick={ handleSaveClick }>保存</Button>
          {
            typeof autoRecordTimer === 'number'
              ? <Button type="primary" danger={ true } onClick={ handleStopAutoRecordClick }>停止录制</Button>
              : <Button type="primary" onClick={ handleStartAutoRecordClick }>自动录制</Button>
          }
        </Button.Group>
        <Pocket48Login className="align-bottom" />
      </Header>
      <p className={ classNames('text-[12px]', commonStyle.tips) }>
        为了避免对服务器造成压力，自动录制最多支持选择5位成员。
      </p>
      <Table size="middle"
        columns={ columns }
        dataSource={ roomVoice }
        bordered={ true }
        rowKey={ dbConfig.objectStore[5].key }
        pagination={{
          showQuickJumper: true
        }}
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default Voice;