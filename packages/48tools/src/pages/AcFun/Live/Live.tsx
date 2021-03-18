import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, useState, useEffect, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { render } from 'react-dom';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Table, message, Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash-es';
import { Onion } from '@bbkkbkk/q';
import FFMpegDownloadWorker from 'worker-loader!../../../utils/worker/FFMpegDownload.worker';
import style from './live.sass';
import Header from '../../../components/Header/Header';
import AcFunLogin from '../../../components/AcFunLogin/AcFunLogin';
import AddForm from './AddForm';
import {
  idbCursorAcFunLiveList,
  idbDeleteAcFunLiveList,
  setAddLiveWorker,
  setDeleteLiveWorker,
  AcFunLiveInitialState
} from '../reducers/live';
import { requestAcFunLiveHtml, requestRestAppVisitorLogin, requestWebTokenGet, requestPlayUrl } from '../services/live';
import dbConfig from '../../../utils/idb/dbConfig';
import { getAcFuncCookie, getFFmpeg, getFileTime } from '../../../utils/utils';
import type { WebWorkerChildItem, MessageEventData } from '../../../types';
import type { LiveRepresentation, LiveVideoPlayRes, LiveItem } from '../types';
import type { AppVisitorLogin, WebToken, LiveWebStartPlay } from '../services/interface';

let divElement: HTMLDivElement | null = null;

/* redux selector */
const selector: Selector<any, AcFunLiveInitialState> = createStructuredSelector({
  // 配置的acfun直播间信息
  acfunLiveList: createSelector(
    ({ acfunLive }: { acfunLive: AcFunLiveInitialState }): Array<LiveItem> => acfunLive.acfunLiveList,
    (data: Array<LiveItem>): Array<LiveItem> => data
  ),
  // 直播下载
  liveWorkers: createSelector(
    ({ acfunLive }: { acfunLive: AcFunLiveInitialState }): Array<WebWorkerChildItem> => acfunLive.liveWorkers,
    (data: Array<WebWorkerChildItem>): Array<WebWorkerChildItem> => data
  )
});

/* A站直播抓取 */
function Live(props: {}): ReactElement {
  const { acfunLiveList, liveWorkers }: AcFunLiveInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 停止
  function handleStopClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveWorkers, { id: record.id });

    if (index >= 0) {
      liveWorkers[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 直播
  function playerUrlWorkerMiddleware(ctx: any, next: Function): void {
    const { record, player, filePath }: { record: LiveItem; player: string; filePath: string } = ctx;

    try {
      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveWorker(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: player,
        filePath,
        id: record.id,
        ffmpeg: getFFmpeg(),
        ua: true
      });

      dispatch(setAddLiveWorker({
        id: record.id,
        worker
      }));
    } catch (err) {
      console.error(err);
      message.error('录制失败！');
    }
  }

  // 选择直播地址
  function selectPlayerUrlMiddleware(ctx: any, next: Function): void {
    const { representation, record }: { representation: Array<LiveRepresentation>; record: LiveItem } = ctx;

    function SelectPlayerUrl(props1: {}): ReactElement {
      const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(true);

      // 全部关闭后清除
      function afterClose(): void {
        document.body.removeChild(divElement!);
        divElement = null;
      }

      // 确认
      async function handleOkClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
        if (ctx.player) {
          const time: string = getFileTime();
          const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
            defaultPath: `[A站直播]${ record.roomId }_${ time }.flv`
          });

          if (result.canceled || !result.filePath) return;

          ctx.filePath = result.filePath;
          next();
          setVisible(false);
        } else {
          message.warn('请先选择一个直播源。');
        }
      }

      // 关闭弹出层
      function handleCloseClick(event: MouseEvent<HTMLButtonElement>): void {
        setVisible(false);
      }

      return (
        <Modal title="选择直播源"
          visible={ visible }
          width={ 400 }
          centered={ true }
          okText="开始录制"
          getContainer={ (): HTMLDivElement => divElement! }
          afterClose={ afterClose }
          onOk={ handleOkClick }
          onCancel={ handleCloseClick }
        >
          <div className={ style.selectBox }>
            <Select className={ style.selectInput } onSelect={ (value: string): string => (ctx.player = value) }>
              {
                representation.map((o: LiveRepresentation): ReactElement => (
                  <Select.Option key={ o.url } value={ o.url }>{ o.name }</Select.Option>
                ))
              }
            </Select>
          </div>
        </Modal>
      );
    }

    divElement = document.createElement('div');
    render(<SelectPlayerUrl />, divElement);
    document.body.appendChild(divElement);
  }

  // 获取直播地址
  async function getLivePlayerUrlMiddleware(ctx: any, next: Function): Promise<void> {
    const { record }: { record: LiveItem } = ctx;
    const didCookie: string = await requestAcFunLiveHtml(record.roomId);
    const cookie: string| undefined = getAcFuncCookie();
    let userId: number, token: string;

    if (cookie) {
      const tokenRes: WebToken = await requestWebTokenGet();

      userId = tokenRes.userId;
      token = tokenRes['acfun.midground.api_st'];
    } else {
      const tokenRes: AppVisitorLogin = await requestRestAppVisitorLogin(didCookie);

      userId = tokenRes.userId;
      token = tokenRes['acfun.api.visitor_st'];
    }

    const playerRes: LiveWebStartPlay = await requestPlayUrl(didCookie, token, userId, !cookie, record.roomId);

    if (playerRes.result !== 1) {
      return message.warn(playerRes.error_msg ?? '当前直播未开始！');
    }

    const videoPlayRes: LiveVideoPlayRes = JSON.parse(playerRes.data.videoPlayRes);
    const representation: Array<LiveRepresentation> = videoPlayRes.liveAdaptiveManifest[0].adaptationSet.representation;

    ctx.representation = representation;
    next();
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const onion: Onion = new Onion();

    onion.use(getLivePlayerUrlMiddleware);
    onion.use(selectPlayerUrlMiddleware);
    onion.use(playerUrlWorkerMiddleware);
    await onion.run({ record });
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(idbDeleteAcFunLiveList({
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
        const idx: number = findIndex(liveWorkers, { id: record.id });

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Button type="primary"
                  danger={ true }
                  onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                >
                  停止录制
                </Button>
              ) : (
                <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleRecordClick(record, event) }>
                  开始录制
                </Button>
              )
            }
            <Button type="primary"
              danger={ true }
              disabled={ idx >= 0 }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteRoomIdClick(record, event) }
            >
              删除
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(idbCursorAcFunLiveList({
      query: { indexName: dbConfig.objectStore[1].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <Header>
        <Button.Group>
          <AcFunLogin />
          <AddForm />
        </Button.Group>
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
    </Fragment>
  );
}

export default Live;