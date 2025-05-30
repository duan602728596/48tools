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
import { Button, Table, message, Modal, Select, Popconfirm, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import {
  requestAcFunLiveHtml,
  requestRestAppVisitorLogin,
  requestWebTokenGet,
  requestPlayUrl,
  type AppVisitorLogin,
  type WebToken,
  type LiveWebStartPlay
} from '@48tools-api/acfun';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../utils/worker/FFmpegDownload.worker/getFFmpegDownloadWorker';
import Header from '../../../components/Header/Header';
import AddLiveRoomForm from '../../../components/AddLiveRoomForm/AddLiveRoomForm';
import AcFunLogin from '../../../functionalComponents/AcFunLogin/AcFunLogin';
import {
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  setAddWorkerItem,
  setRemoveWorkerItem,
  selectorsObject
} from '../reducers/acfunLive';
import dbConfig from '../../../utils/IDB/IDBConfig';
import { getAcFuncCookie, getFFmpeg, getFilePath } from '../../../utils/utils';
import type { LiveSliceInitialState, LiveSliceSelectorNoAutoRecordTimer } from '../../../store/slice/LiveSlice';
import type { WebWorkerChildItem, MessageEventData, LiveItem } from '../../../commonTypes';
import type { LiveRepresentation, LiveVideoPlayRes } from '../types';

interface SelectUrlPromiseResolveValue {
  url: string;
  filePath: string;
}

let selectUrlPromise: PromiseWithResolvers<SelectUrlPromiseResolveValue | undefined> | null = null;
let recordCache: LiveItem;

/* redux selector */
type RState = { acfunLive: LiveSliceInitialState };

const selector: Selector<RState, LiveSliceSelectorNoAutoRecordTimer> = createStructuredSelector({ ...selectorsObject });

/* A站直播抓取 */
function Live(props: {}): ReactElement {
  const { liveList: acfunLiveList, workerList: liveWorkers }: LiveSliceSelectorNoAutoRecordTimer = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [acfunLiveUrlSelectOptions, setAcfunLiveUrlSelectOptions]: [Array<DefaultOptionType>, D<S<Array<DefaultOptionType>>>] = useState([]);
  const [acfunLiveSelectOpen, setAcfunLiveSelectOpen]: [boolean, D<S<boolean>>] = useState(false);
  const [acfunLiveUrlSelectValue, setAcfunLiveUrlSelectValue]: [string | undefined, D<S<string | undefined>>] = useState(undefined);
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = liveWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      liveWorkers[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 录制
  function acfunLivePlayerUrlWorker(record: LiveItem, selectUrlValue: SelectUrlPromiseResolveValue): void {
    try {
      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setRemoveWorkerItem(record.id));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: selectUrlValue.url,
        filePath: selectUrlValue.filePath,
        id: record.id,
        ffmpeg: getFFmpeg(),
        ua: true
      });

      dispatch(setAddWorkerItem({
        id: record.id,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('录制失败！');
    }
  }

  // 开始录制
  async function handleRecordNextClick(record: LiveItem, event: MouseEvent): Promise<void> {
    const didCookie: string = await requestAcFunLiveHtml(record.roomId);
    const cookie: string| undefined = getAcFuncCookie();
    let userId: number, token: string;

    if (cookie) {
      try {
        const tokenRes: WebToken = await requestWebTokenGet();

        userId = tokenRes.userId;
        token = tokenRes['acfun.midground.api_st'];
      } catch (err) {
        console.error(err);
        messageApi.error('获取直播地址失败！可能是你的Cookie已过期，请重新登陆。');

        return;
      }
    } else {
      const tokenRes: AppVisitorLogin = await requestRestAppVisitorLogin(didCookie);

      userId = tokenRes.userId;
      token = tokenRes['acfun.api.visitor_st'];
    }

    const playerRes: LiveWebStartPlay = await requestPlayUrl(didCookie, token, userId, !cookie, record.roomId);

    if (playerRes.result !== 1) {
      messageApi.warning(playerRes.error_msg ?? '当前直播未开始！');

      return;
    }

    const videoPlayRes: LiveVideoPlayRes = JSON.parse(playerRes.data.videoPlayRes);
    const representation: Array<LiveRepresentation> = videoPlayRes.liveAdaptiveManifest[0].adaptationSet.representation;

    recordCache = record;
    setAcfunLiveUrlSelectOptions(
      representation.map((o: LiveRepresentation): DefaultOptionType => ({
        label: o.name,
        value: o.url
      }))
    );
    setAcfunLiveUrlSelectValue(undefined);
    setAcfunLiveSelectOpen(true);
    selectUrlPromise = Promise.withResolvers();
    const selectUrlValue: SelectUrlPromiseResolveValue | undefined = await selectUrlPromise.promise;

    if (!selectUrlValue) return;

    acfunLivePlayerUrlWorker(record, selectUrlValue);
  }

  // 确认选择
  async function handleAcfunSelectUrlModelOkClick(event: MouseEvent): Promise<void> {
    if (!acfunLiveUrlSelectValue) {
      messageApi.warning('请先选择一个直播源。');

      return;
    }

    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: getFilePath({
        typeTitle: 'A站直播',
        infoArray: [recordCache.roomId, recordCache.description],
        ext: 'flv'
      })
    });

    if (result.canceled || !result.filePath) return;

    selectUrlPromise?.resolve?.({
      url: acfunLiveUrlSelectValue,
      filePath: result.filePath
    });
    setAcfunLiveSelectOpen(false);
  }

  // 关闭选择
  function handleCloseAcfunSelectUrlModelClick(event: MouseEvent): void {
    selectUrlPromise?.resolve?.(undefined);
    setAcfunLiveSelectOpen(false);
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent): void {
    dispatch(IDBDeleteLiveItem({
      query: record.id
    }));
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
    {
      title: '操作',
      key: 'handle',
      width: 175,
      render: (value: undefined, record: LiveItem, index: number): ReactElement => {
        const idx: number = liveWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

        return (
          <Space.Compact>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止录制吗？"
                  onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止录制</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent): Promise<void> => handleRecordNextClick(record, event) }>
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
          </Space.Compact>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(IDBCursorLiveList({
      query: { indexName: dbConfig.objectStore[1].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <Space.Compact>
          <AcFunLogin />
          <AddLiveRoomForm dataTestId="acfun-add-live-id-btn"
            modalTitle="添加A站直播间信息"
            IDBSaveDataFunc={ IDBSaveLiveItem }
          />
        </Space.Compact>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ acfunLiveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[1].key }
        pagination={{
          showQuickJumper: true
        }}
      />
      <Modal title="选择直播源"
        open={ acfunLiveSelectOpen }
        width={ 400 }
        centered={ true }
        okText="开始录制"
        onOk={ handleAcfunSelectUrlModelOkClick }
        onCancel={ handleCloseAcfunSelectUrlModelClick }
      >
        <div className="h-[60px]" data-test-id="acfun-live-type">
          <Select className="!w-full"
            value={ acfunLiveUrlSelectValue }
            options={ acfunLiveUrlSelectOptions }
            onSelect={ (value: string): void => setAcfunLiveUrlSelectValue(value) }
          />
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default Live;