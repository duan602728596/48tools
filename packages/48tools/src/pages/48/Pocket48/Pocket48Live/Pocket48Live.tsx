import { randomUUID } from 'node:crypto';
import { ipcRenderer, clipboard, type SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
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
import { Link } from 'react-router-dom';
import { Button, message, Table, Tag, Popconfirm, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as dayjs from 'dayjs';
import filenamify from 'filenamify/browser';
import { Onion } from '@bbkkbkk/q';
import getFFMpegDownloadWorker from '../../../../utils/worker/getFFMpegDownloadWorker';
import getDownloadAndTranscodingWorker from './DownloadAndTranscodingWorker/getDownloadAndTranscodingWorker';
import { pick } from '../../../../utils/lodash';
import Header from '../../../../components/Header/Header';
import { requestLiveRoomInfo } from '../../services/pocket48';
import {
  reqLiveList,
  setAddLiveChildList,
  setDeleteLiveChildList,
  setAutoGrab,
  IDBGetPocket48LiveOptions,
  type Pocket48InitialState
} from '../../reducers/pocket48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import {
  netMediaServerInit,
  getNetMediaServerPort,
  type NetMediaServerPort
} from '../../../../utils/nodeMediaServer/nodeMediaServer';
import downloadImages from './downloadImages/downloadImages';
import autoGrab from './autoGrab';
import { OPTIONS_NAME } from '../LiveOptions/LiveOptions';
import type { WebWorkerChildItem, MessageEventData } from '../../../../types';
import type { Pocket48LiveAutoGrabOptions } from '../../types';
import type { LiveInfo, LiveRoomInfo } from '../../services/interface';

/* redux selector */
type RSelector = Pick<Pocket48InitialState, 'liveList' | 'liveChildList' | 'autoGrabTimer'>;
type RState = { pocket48: Pocket48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 直播列表
  liveList: ({ pocket48 }: RState): Array<LiveInfo> => pocket48.liveList,

  // 直播下载
  liveChildList: ({ pocket48 }: RState): Array<WebWorkerChildItem> => pocket48.liveChildList,

  // 自动抓取的定时器
  autoGrabTimer: ({ pocket48 }: RState): number | null => pocket48.autoGrabTimer
});

/* 直播抓取 */
function Pocket48Live(props: {}): ReactElement {
  const { liveList, liveChildList, autoGrabTimer }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading

  // 停止自动抓取
  function handleStopAutoGrabClick(event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setAutoGrab(null));
    message.info('停止自动抓取。');
  }

  // 开始自动抓取
  async function handleStartAutoGrabClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    type LiveOptionsResult = { name: string; value: Pocket48LiveAutoGrabOptions };
    type OnionContext = { result: LiveOptionsResult; transcoding?: boolean };

    // 获取配置
    const result: { query: string; result?: LiveOptionsResult }
      = await dispatch(IDBGetPocket48LiveOptions({ query: OPTIONS_NAME }));

    if (!result.result) {
      return message.warn('请先配置自动抓取相关配置。');
    }

    // 格式化配置数据
    const usersArr: string[] = result.result.value.users
      .split(/\s*[,，]\s*/i)
      .filter((o: string): boolean => o !== '');

    if (usersArr.length === 0) {
      return message.warn('请先配置自动抓取监听的成员直播。');
    }

    const onion: Onion = new Onion();

    // 判断是否需要转码
    onion.use(function(ctx: OnionContext, next: Function): void {
      Modal.confirm({
        content: '选择要录制的视频方法。',
        closable: false,
        keyboard: false,
        mask: false,
        maskClosable: false,
        centered: true,
        okText: '录制（修复连麦用）',
        cancelText: '录制',
        onOk(): void {
          ctx.transcoding = true;
          next();
        },
        onCancel(): void {
          ctx.transcoding = false;
          next();
        }
      });
    });

    // 自动抓取
    onion.use(function(ctx: OnionContext, next: Function): void {
      const { result: r, transcoding = false }: OnionContext = ctx;

      message.info('开始自动抓取。');
      autoGrab(r.value.dir, usersArr, transcoding);
      dispatch(setAutoGrab(
        setInterval(autoGrab, r.value.time * 60_000, r.value.dir, usersArr, transcoding)
      ));
      next();
    });

    onion.run({ result: result.result });
  }

  // 复制直播地址
  async function handleCopyLiveUrlClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    clipboard.writeText(resInfo.content.playStreamPath);
    message.info('直播地址复制到剪贴板。');
  }

  // 下载图片
  async function handleDownloadImagesClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    downloadImages(record, record.coverPath, resInfo.content?.carousels?.carousels);
  }

  // 停止
  function handleStopClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.liveId);

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  /**
   * 录制
   * @param { LiveInfo } record: 直播信息
   * @param { boolean } transcoding: 为true时，每次都会重新编码，而不是采用视频开始时的编码，可以修复连麦问题
   * @param { MouseEvent<HTMLButtonElement> } event
   */
  async function handleGetVideoClick(record: LiveInfo, transcoding: boolean, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
        defaultPath: `[口袋48直播]${ record.userInfo.nickname }_${ filenamify(record.title) }`
          + `@${ getFileTime(record.ctime) }__${ getFileTime() }.${ transcoding ? 'ts' : 'flv' }`
      });

      if (result.canceled || !result.filePath) return;

      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const worker: Worker = transcoding ? getDownloadAndTranscodingWorker() : getFFMpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resInfo.content.playStreamPath,
        filePath: result.filePath,
        ffmpeg: getFFmpeg()
      });

      dispatch(setAddLiveChildList({
        id: record.liveId,
        worker
      }));
    } catch (err) {
      console.error(err);
      message.error('直播录制失败！');
    }
  }

  // 打开新窗口播放视频
  function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const port: NetMediaServerPort = getNetMediaServerPort();
    const searchParams: URLSearchParams = new URLSearchParams(Object.assign(
      {
        id: randomUUID(), // rtmp服务器id
        ...port           // 端口号
      },
      pick(record, [
        'coverPath', // 头像
        'title',     // 直播间标题
        'liveId',    // 直播id
        'liveType'   // 直播类型
      ])
    ));

    ipcRenderer.send('player.html', record.title, searchParams.toString());
  }

  // 点击刷新直播列表
  async function handleRefreshLiveListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      await dispatch<any>(reqLiveList());
    } catch (err) {
      message.error('直播列表加载失败！');
      console.error(err);
    }

    setLoading(false);
  }

  const columns: ColumnsType<LiveInfo> = [
    { title: '标题', dataIndex: 'title' },
    { title: '成员', dataIndex: ['userInfo', 'nickname'] },
    {
      title: '类型',
      dataIndex: 'liveType',
      width: 115,
      render: (value: 1 | 2, record: LiveInfo, index: number): ReactElement => {
        return (
          <Fragment>
            { value === 2 ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag> }
            { record.inMicrophoneConnection && <Tag className="m-0" color="cyan">连麦</Tag> }
          </Fragment>
        );
      }
    },
    {
      title: '时间',
      dataIndex: 'ctime',
      width: 170,
      render: (value: string, record: LiveInfo, index: number): string => dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 245,
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        const idx: number = liveChildList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.liveId);
        const inRecording: boolean = idx >= 0;

        return (
          <Fragment>
            <div className="mb-[6px]">
              <Button.Group>
                {
                  inRecording ? (
                    <Popconfirm title="确定要停止录制吗？"
                      onConfirm={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                    >
                      <Button type="primary" danger={ true }>停止</Button>
                    </Popconfirm>
                  ) : (
                    <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> =>
                      handleGetVideoClick(record, false, event) }>
                      录制
                    </Button>
                  )
                }
                <Button disabled={ inRecording }
                  onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleGetVideoClick(record, true, event) }
                >
                  录制（修复连麦用）
                </Button>
              </Button.Group>
            </div>
            <Button.Group size="small">
              <Button onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleOpenPlayerClick(record, event) }>
                播放
              </Button>
              <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadImagesClick(record, event) }>
                下载图片
              </Button>
              <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleCopyLiveUrlClick(record, event) }>
                复制直播地址
              </Button>
            </Button.Group>
          </Fragment>
        );
      }
    }
  ];

  useEffect(function(): void {
    netMediaServerInit();
  }, []);

  return (
    <Fragment>
      <Header>
        <Button.Group>
          <Button type="primary" onClick={ handleRefreshLiveListClick }>刷新列表</Button>
          {
            typeof autoGrabTimer === 'number'
              ? <Button type="primary" danger={ true } onClick={ handleStopAutoGrabClick }>停止自动抓取</Button>
              : <Button onClick={ handleStartAutoGrabClick }>开始自动抓取</Button>
          }
          <Link to="/48/LiveOptions">
            <Button>自动抓取配置</Button>
          </Link>
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        loading={ loading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Pocket48Live;