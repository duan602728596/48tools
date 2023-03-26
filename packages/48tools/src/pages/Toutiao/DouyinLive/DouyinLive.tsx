import type { SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Popconfirm, Table, message, Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { BaseOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import style from './douyinLive.sass';
import { showSaveDialog } from '../../../utils/remote/dialog';
import Header from '../../../components/Header/Header';
import AddLiveRoomForm from '../../../components/AddLiveRoomForm/AddLiveRoomForm';
import {
  IDBSaveRoomVoiceInfo,
  IDBCursorRoomVoiceInfo,
  IDBDeleteRoomVoiceInfo,
  setAddDownloadWorker,
  setRemoveDownloadWorker,
  douyinLiveWorkerListSelectors,
  type DouyinLiveInitialState
} from '../reducers/douyinLive';
import dbConfig from '../../../utils/IDB/IDBConfig';
import { getFFmpeg, getFileTime } from '../../../utils/utils';
import getFFmpegDownloadWorker from '../../../utils/worker/getFFmpegDownloadWorker';
import { requestLiveEnter, requestTtwidCookie } from '../services/douyin';
import { douyinCookie } from '../Douyin/function/DouyinCookieStore';
import type { WebWorkerChildItem, MessageEventData } from '../../../commonTypes';
import type { DouyinLiveItem } from '../types';
import type { LiveEnter } from '../services/interface';

/* redux selector */
type RSelector = Pick<DouyinLiveInitialState, 'douyinLiveList'> & {
  douyinLiveWorkerList: Array<WebWorkerChildItem>;
};
type RState = { douyinLive: DouyinLiveInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 正在下载
  douyinLiveWorkerList: ({ douyinLive }: RState): Array<WebWorkerChildItem> => douyinLiveWorkerListSelectors.selectAll(douyinLive),

  // 数据库保存的数据
  douyinLiveList: ({ douyinLive }: RState): Array<DouyinLiveItem> => douyinLive.douyinLiveList
});

/* 抖音直播抓取 */
function DouyinLive(props: {}): ReactElement {
  const { douyinLiveWorkerList, douyinLiveList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [open, setOpen]: [boolean, D<S<boolean>>] = useState(false); // 弹出层状态
  const [liveOptions, setLiveOptions]: [Array<BaseOptionType>, D<S<BaseOptionType[]>>] = useState([]); // 直播的地址
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 选择并开始录制
  async function handleStartRecordSelect(
    value: string,
    options: BaseOptionType & { type: 'flv' | 'm3u8'; item: DouyinLiveItem }
  ): Promise<void> {
    const time: string = getFileTime();

    try {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[抖音直播]${ options.item.roomId }_${ time }.${ options.type === 'm3u8' ? 'ts' : 'flv' }`
      });

      if (result.canceled || !result.filePath) return;

      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(messageEvent: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = messageEvent.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`抖音直播[${ options.item.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setRemoveDownloadWorker(options.item.id));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: options.value,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddDownloadWorker({
        id: options.item.id,
        worker
      }));
      setOpen(false);
    } catch (err) {
      console.error(err);
      messageApi.error('录制失败！');
    }
  }

  // 停止
  function handleStopClick(record: DouyinLiveItem, event?: MouseEvent): void {
    const index: number = douyinLiveWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      douyinLiveWorkerList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 删除
  function handleDeleteRoomIdClick(record: DouyinLiveItem, event: MouseEvent): void {
    dispatch(IDBDeleteRoomVoiceInfo({
      query: record.id
    }));
  }

  // 录制直播
  async function handleRecordClick(record: DouyinLiveItem, event: MouseEvent): Promise<void> {
    try {
      await requestTtwidCookie(); // 获取ttwid的cookie
      const res: LiveEnter | string = await requestLiveEnter(douyinCookie.toString(), record.roomId);

      if (typeof res === 'object') {
        if (res?.data?.data?.length && res.data.data[0]?.stream_url) {
          const options: Array<BaseOptionType> = [];

          for (const key in res.data.data[0].stream_url.flv_pull_url) {
            options.push({
              label: `FLV - ${ key }`,
              value: res.data.data[0].stream_url.flv_pull_url[key],
              type: 'flv',
              item: record
            });
          }

          for (const key in res.data.data[0].stream_url.hls_pull_url_map) {
            options.push({
              label: `M3U8 - ${ key }`,
              value: res.data.data[0].stream_url.hls_pull_url_map[key],
              type: 'm3u8',
              item: record
            });
          }

          setLiveOptions(options);
          setOpen(true);
        } else {
          messageApi.warning('直播未开启！');
        }
      } else {
        messageApi.error('抖音Cookie错误或其他错误，请联系开发者！');
      }
    } catch (err) {
      console.error(err);
    }
  }

  const columns: ColumnsType<DouyinLiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
    {
      title: '操作',
      key: 'handle',
      width: 175,
      render: (value: undefined, record: DouyinLiveItem, index: number): ReactElement => {
        const idx: number = douyinLiveWorkerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止录制吗？"
                  onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止录制</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent): Promise<void> => handleRecordClick(record, event) }>
                  开始录制
                </Button>
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ idx >= 0 }
              onClick={ (event: MouseEvent): void => handleDeleteRoomIdClick(record, event) }
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
      query: { indexName: dbConfig.objectStore[6].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <AddLiveRoomForm modalTitle="添加抖音直播间信息" IDBSaveDataFunc={ IDBSaveRoomVoiceInfo } />
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ douyinLiveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[6].key }
        pagination={{
          showQuickJumper: true
        }}
      />
      <Modal title="选择直播地址"
        open={ open }
        width={ 400 }
        centered={ true }
        closable={ false }
        maskClosable={ false }
        destroyOnClose={ true }
        footer={ <Button onClick={ (event: MouseEvent): void => setOpen(false) }>关闭</Button> }
      >
        <Select className={ style.select } options={ liveOptions } onSelect={ handleStartRecordSelect } />
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default DouyinLive;