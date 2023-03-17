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
import { createRoot, type Root } from 'react-dom/client';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Table, message, Modal, Select, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { Onion } from '@bbkkbkk/q';
import style from './live.sass';
import { showSaveDialog } from '../../../utils/remote/dialog';
import getFFmpegDownloadWorker from '../../../utils/worker/getFFmpegDownloadWorker';
import Header from '../../../components/Header/Header';
import AcFunLogin from '../../../functionalComponents/AcFunLogin/AcFunLogin';
import AddForm from './AddForm';
import {
  IDBCursorAcFunLiveList,
  IDBDeleteAcFunLiveList,
  setAddLiveWorker,
  setDeleteLiveWorker,
  type AcFunLiveInitialState
} from '../reducers/live';
import { requestAcFunLiveHtml, requestRestAppVisitorLogin, requestWebTokenGet, requestPlayUrl } from '../services/live';
import dbConfig from '../../../utils/IDB/IDBConfig';
import { getAcFuncCookie, getFFmpeg, getFileTime } from '../../../utils/utils';
import AntdConfig from '../../../components/AntdConfig/AntdConfig';
import ThemeProvider from '../../../components/Theme/ThemeProvider';
import type { WebWorkerChildItem, MessageEventData } from '../../../commonTypes';
import type { LiveRepresentation, LiveVideoPlayRes, LiveItem } from '../types';
import type { AppVisitorLogin, WebToken, LiveWebStartPlay } from '../services/interface';

let divElement: HTMLDivElement | null = null;
let divRoot: Root | null = null;

/* redux selector */
type RState = { acfunLive: AcFunLiveInitialState };

const selector: Selector<RState, AcFunLiveInitialState> = createStructuredSelector({
  // 配置的acfun直播间信息
  acfunLiveList: ({ acfunLive }: RState): Array<LiveItem> => acfunLive.acfunLiveList,

  // 直播下载
  liveWorkers: ({ acfunLive }: RState): Array<WebWorkerChildItem> => acfunLive.liveWorkers
});

/* A站直播抓取 */
function Live(props: {}): ReactElement {
  const { acfunLiveList, liveWorkers }: AcFunLiveInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = liveWorkers.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      liveWorkers[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 直播
  function playerUrlWorkerMiddleware(ctx: any, next: Function): void {
    const { record, player, filePath }: { record: LiveItem; player: string; filePath: string } = ctx;

    try {
      const worker: Worker = getFFmpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`${ record.description }[${ record.roomId }]录制失败！`);
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
      messageApi.error('录制失败！');
    }
  }

  // 选择直播地址
  function selectPlayerUrlMiddleware(ctx: any, next: Function): void {
    const { representation, record }: { representation: Array<LiveRepresentation>; record: LiveItem } = ctx;

    function SelectPlayerUrl(props1: {}): ReactElement {
      const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(true);

      // 全部关闭后清除
      function afterClose(): void {
        requestAnimationFrame((): void => {
          document.body.removeChild(divElement!);
          divRoot?.unmount();
          divRoot = null;
          divElement = null;
        });
      }

      // 确认
      async function handleOkClick(event: MouseEvent): Promise<void> {
        if (ctx.player) {
          const time: string = getFileTime();
          const result: SaveDialogReturnValue = await showSaveDialog({
            defaultPath: `[A站直播]${ record.roomId }_${ time }.flv`
          });

          if (result.canceled || !result.filePath) return;

          ctx.filePath = result.filePath;
          next();
          setVisible(false);
        } else {
          messageApi.warning('请先选择一个直播源。');
        }
      }

      // 关闭弹出层
      function handleCloseClick(event: MouseEvent): void {
        setVisible(false);
      }

      return (
        <ThemeProvider>
          <AntdConfig>
            <Modal title="选择直播源"
              open={ visible }
              width={ 400 }
              centered={ true }
              okText="开始录制"
              getContainer={ (): HTMLDivElement => divElement! }
              afterClose={ afterClose }
              onOk={ handleOkClick }
              onCancel={ handleCloseClick }
            >
              <div className="h-[60px]" data-test-id="acfun-live-type">
                <Select className={ style.selectInput } onSelect={ (value: string): string => (ctx.player = value) }>
                  {
                    representation.map((o: LiveRepresentation): ReactElement => (
                      <Select.Option key={ o.url } value={ o.url }>{ o.name }</Select.Option>
                    ))
                  }
                </Select>
              </div>
            </Modal>
          </AntdConfig>
        </ThemeProvider>
      );
    }

    divElement = document.createElement('div');
    document.body.appendChild(divElement);
    divRoot = createRoot(divElement);
    divRoot.render(<SelectPlayerUrl />);
  }

  // 获取直播地址
  async function getLivePlayerUrlMiddleware(ctx: any, next: Function): Promise<void> {
    const { record }: { record: LiveItem } = ctx;
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

    ctx.representation = representation;
    next();
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent): Promise<void> {
    const onion: Onion = new Onion();

    onion.use(getLivePlayerUrlMiddleware);
    onion.use(selectPlayerUrlMiddleware);
    onion.use(playerUrlWorkerMiddleware);
    await onion.run({ record });
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent): void {
    dispatch(IDBDeleteAcFunLiveList({
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
    dispatch(IDBCursorAcFunLiveList({
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
      { messageContextHolder }
    </Fragment>
  );
}

export default Live;