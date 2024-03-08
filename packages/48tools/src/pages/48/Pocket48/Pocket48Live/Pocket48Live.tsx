import { randomUUID } from 'node:crypto';
import { ipcRenderer, clipboard, type SaveDialogReturnValue } from 'electron';
import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, message, Table, Popconfirm, Modal, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MessageInstance } from 'antd/es/message/interface';
import type { UseModalReturnType, UseMessageReturnType, ModuleFuncReturn } from '@48tools-types/antd';
import * as dayjs from 'dayjs';
import filenamify from 'filenamify/browser';
import { Onion } from '@bbkkbkk/q';
import { requestLiveRoomInfo, type LiveInfo, type LiveRoomInfo } from '@48tools-api/48';
import { WinIpcChannel } from '@48tools/main/src/channelEnum';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import getPocket48LiveDownloadWorker from '../function/Pocket48LiveDownload.worker/getPocket48LiveDownloadWorker';
import getDownloadAndTranscodingWorker from '../function/DownloadAndTranscodingWorker/getDownloadAndTranscodingWorker';
import Pocket48LiveRender from '../function/Pocket48LiveRender';
import { pick } from '../../../../utils/lodash';
import Header from '../../../../components/Header/Header';
import ButtonLink from '../../../../components/ButtonLink/ButtonLink';
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
import autoGrab from '../function/autoGrab';
import { OPTIONS_NAME } from '../LiveOptions/LiveOptions';
import LiveType from '../../components/LiveType/LiveType';
import type { WebWorkerChildItem, MessageEventData, LiveStatusEventData } from '../../../../commonTypes';
import type { Pocket48LiveAutoGrabOptions, Pocket48LiveWorker } from '../../types';

function isWorker(w: Pocket48LiveWorker['worker']): w is Worker {
  return w instanceof Worker;
}

/* redux selector */
type RSelector = Pick<Pocket48InitialState, 'liveList' | 'liveChildList' | 'autoGrabTimer'>;
type RState = { pocket48: Pocket48InitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 直播列表
  liveList: ({ pocket48 }: RState): Array<LiveInfo> => pocket48.liveList,

  // 直播下载
  liveChildList: ({ pocket48 }: RState): Array<Pocket48LiveWorker> => pocket48.liveChildList,

  // 自动抓取的定时器
  autoGrabTimer: ({ pocket48 }: RState): number | null => pocket48.autoGrabTimer
});

/* 直播抓取 */
function Pocket48Live(props: {}): ReactElement {
  const { liveList, liveChildList, autoGrabTimer }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [modalApi, modalContextHolder]: UseModalReturnType = Modal.useModal();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading
  const [searchValue, setSearchValue]: [string, D<S<string>>] = useState(''); // 搜索值

  // 搜索结果
  const filterSearchResultLiveList: Array<LiveInfo> = useMemo(function(): Array<LiveInfo> {
    if (/^\s*$/.test(searchValue)) {
      return liveList;
    } else {
      return liveList.filter((o: LiveInfo): boolean => o.userInfo.nickname.includes(searchValue));
    }
  }, [liveList, searchValue]);

  // 停止自动抓取
  function handleStopAutoGrabClick(event: MouseEvent): void {
    dispatch(setAutoGrab(null));
    messageApi.info('停止自动抓取。');
  }

  // 开始自动抓取
  async function handleStartAutoGrabClick(event: MouseEvent): Promise<void> {
    type LiveOptionsResult = { name: string; value: Pocket48LiveAutoGrabOptions };
    type OnionContext = { result: LiveOptionsResult; transcoding?: boolean; backup?: boolean };

    // 获取配置
    const result: { query: string; result?: LiveOptionsResult }
      = await dispatch(IDBGetPocket48LiveOptions({ query: OPTIONS_NAME }));

    if (!result.result) {
      messageApi.warning('请先配置自动抓取相关配置。');

      return;
    }

    // 格式化配置数据
    const usersArr: string[] = result.result.value.users
      .split(/\s*[,，]\s*/i)
      .filter((o: string): boolean => o !== '');

    if (usersArr.length === 0) {
      messageApi.info('请先配置自动抓取监听的成员直播。');

      return;
    }

    const onion: Onion = new Onion();

    // 判断是否需要转码
    onion.use(function(ctx: OnionContext, next: Function): void {
      function handleFlvVideoClick(e: MouseEvent): void {
        ctx.transcoding = false;
        next();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        m.destroy();
      }

      function handleTsVideoClick(e: MouseEvent): void {
        ctx.transcoding = true;
        next();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        m.destroy();
      }

      function handleFlvVideoBackupClick(e: MouseEvent): void {
        ctx.backup = true;
        next();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        m.destroy();
      }

      const m: ModuleFuncReturn = modalApi.confirm({
        title: '选择要录制的视频方法',
        content: (
          <Button.Group className="mb-[16px]">
            <Button onClick={ handleFlvVideoClick }>录制(*.flv)</Button>
            <Button onClick={ handleTsVideoClick }>录制(*.ts)</Button>
            <Button onClick={ handleFlvVideoBackupClick }>备用录制(*.flv)</Button>
          </Button.Group>
        ),
        closable: false,
        keyboard: false,
        mask: false,
        maskClosable: false,
        centered: true,
        footer: (
          <div className="text-right">
            <Button onClick={ (e: MouseEvent): void => m.destroy() }>关闭</Button>
          </div>
        )
      });
    });

    // 自动抓取
    onion.use(function(ctx: OnionContext, next: Function): void {
      const { result: r, transcoding = false, backup = false }: OnionContext = ctx;
      const args: [MessageInstance, string, string[], boolean, boolean] = [messageApi, r.value.dir, usersArr, transcoding, backup];

      messageApi.info('开始自动抓取。');
      autoGrab(...args);
      dispatch(setAutoGrab(
        window.setInterval(autoGrab, r.value.time * 60_000, ...args)
      ));
      next();
    });

    onion.run({ result: result.result });
  }

  // 复制直播地址
  async function handleCopyLiveUrlClick(record: LiveInfo, event: MouseEvent): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    clipboard.writeText(resInfo.content.playStreamPath);
    messageApi.info('直播地址复制到剪贴板。');
  }

  // 下载图片
  async function handleDownloadImagesClick(record: LiveInfo, event: MouseEvent): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);

    downloadImages(modalApi, record, record.coverPath, resInfo.content?.carousels?.carousels);
  }

  /**
   * 备用方案录制
   * @param { LiveInfo } record - 直播信息
   * @param { MouseEvent<HTMLButtonElement> } event
   */
  async function handleGetVideoBackupClick(record: LiveInfo, event: MouseEvent): Promise<void> {
    try {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[口袋48直播(备用录制)]${ record.userInfo.nickname }_${ filenamify(record.title) }`
          + `@${ getFileTime(record.ctime) }__${ getFileTime() }.flv`
      });

      if (result.canceled || !result.filePath) return;

      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const pocket48LiveRender: Pocket48LiveRender = new Pocket48LiveRender({
        id: randomUUID(),
        liveId: record.liveId,
        roomId: resInfo.content.roomId,
        playStreamPath: resInfo.content.playStreamPath,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        onClose(id: string): void {
          dispatch(setDeleteLiveChildList(record));
        }
      });

      dispatch(setAddLiveChildList({
        id: record.liveId,
        worker: pocket48LiveRender
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('直播录制失败！');
    }
  }

  // 停止
  function handleStopClick(record: LiveInfo, event?: MouseEvent): void {
    const index: number = liveChildList.findIndex((o: Pocket48LiveWorker): boolean => o.id === record.liveId);

    if (index >= 0) {
      const w: Pocket48LiveWorker['worker'] = liveChildList[index].worker;

      if (isWorker(w)) {
        w.postMessage({ type: 'stop' });
      } else {
        w.kill();
      }
    }
  }

  /**
   * 录制
   * @param { LiveInfo } record - 直播信息
   * @param { boolean } transcoding - 为true时，每次都会重新编码，而不是采用视频开始时的编码，可以修复连麦问题
   * @param { MouseEvent<HTMLButtonElement> } event
   */
  async function handleGetVideoClick(record: LiveInfo, transcoding: boolean, event: MouseEvent): Promise<void> {
    try {
      const result: SaveDialogReturnValue = await showSaveDialog({
        defaultPath: `[口袋48直播]${ record.userInfo.nickname }_${ filenamify(record.title) }`
          + `@${ getFileTime(record.ctime) }__${ getFileTime() }.${ transcoding ? 'ts' : 'flv' }`
      });

      if (result.canceled || !result.filePath) return;

      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const worker: Worker = transcoding ? getDownloadAndTranscodingWorker() : getPocket48LiveDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData | LiveStatusEventData>): void {
        const { type }: MessageEventData | LiveStatusEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            messageApi.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteLiveChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resInfo.content.playStreamPath,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        liveId: record.liveId,
        roomId: resInfo.content.roomId
      });

      dispatch(setAddLiveChildList({
        id: record.liveId,
        worker
      }));
    } catch (err) {
      console.error(err);
      messageApi.error('直播录制失败！');
    }
  }

  // 打开新窗口播放视频
  function handleOpenPlayerClick(record: LiveInfo, event: MouseEvent): void {
    const port: NetMediaServerPort = getNetMediaServerPort();
    const searchParams: URLSearchParams = new URLSearchParams(Object.assign(
      {
        id: record.liveId,  // rtmp服务器id
        playerType: 'live', // 'live' | 'record': 直播还是录播
        ...port             // 端口号
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

  // 点击刷新直播列表
  async function handleRefreshLiveListClick(event: MouseEvent): Promise<void> {
    setLoading(true);

    try {
      await dispatch<any>(reqLiveList());
    } catch (err) {
      messageApi.error('直播列表加载失败！');
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
      render: (value: 1 | 2, record: LiveInfo, index: number): ReactElement => <LiveType liveInfo={ record } />
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
      width: 325,
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
                      onConfirm={ (event?: MouseEvent): void => handleStopClick(record, event) }
                    >
                      <Button type="primary" danger={ true }>停止</Button>
                    </Popconfirm>
                  ) : [
                    <Button key="r-flv" onClick={ (event: MouseEvent): Promise<void> => handleGetVideoClick(record, false, event) }>
                      录制(*.flv)
                    </Button>,
                    <Button key="r-ts" onClick={ (event: MouseEvent): Promise<void> => handleGetVideoClick(record, true, event) }>
                      录制(*.ts)
                    </Button>,
                    <Button key="r-flv-2" onClick={ (event: MouseEvent): Promise<void> => handleGetVideoBackupClick(record, event) }>
                      备用录制(*.flv)
                    </Button>
                  ]
                }
              </Button.Group>
            </div>
            <Button.Group size="small">
              <Button onClick={ (event: MouseEvent): void => handleOpenPlayerClick(record, event) }>
                播放
              </Button>
              <Button onClick={ (event: MouseEvent): Promise<void> => handleDownloadImagesClick(record, event) }>
                下载图片
              </Button>
              <Button onClick={ (event: MouseEvent): Promise<void> => handleCopyLiveUrlClick(record, event) }>
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
        <Input.Search className="w-[200px] mr-[6px]"
          placeholder="输入成员名字搜索"
          onSearch={ (value: string): void => setSearchValue(value) }
        />
        <Button.Group>
          <Button type="primary" onClick={ handleRefreshLiveListClick }>刷新列表</Button>
          {
            typeof autoGrabTimer === 'number'
              ? <Button type="primary" danger={ true } onClick={ handleStopAutoGrabClick }>停止自动抓取</Button>
              : <Button onClick={ handleStartAutoGrabClick }>开始自动抓取</Button>
          }
          <ButtonLink linkProps={{ to: '/48/LiveOptions' }}>自动抓取配置</ButtonLink>
        </Button.Group>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ filterSearchResultLiveList }
        bordered={ true }
        loading={ loading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true
        }}
      />
      { modalContextHolder }
      { messageContextHolder }
    </Fragment>
  );
}

export default Pocket48Live;