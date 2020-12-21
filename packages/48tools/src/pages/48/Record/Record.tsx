import * as path from 'path';
import type { ParsedPath } from 'path';
import { promises as fsP } from 'fs';
import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, useState, useMemo, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch, Store } from 'redux';
import { useStore, useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, message, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Store as FormStore } from 'antd/es/form/interface';
import { findIndex } from 'lodash';
import * as moment from 'moment';
import DownloadWorker from 'worker-loader!./downloadM3u8.worker';
import style from '../index.sass';
import {
  setRecordList,
  setRecordChildList,
  L48InitialState,
  LiveChildItem
} from '../reducers/reducers';
import {
  requestLiveList,
  requestLiveRoomInfo,
  requestDownloadFileByStream,
  requestDownloadFile
} from '../services/services';
import { getFFmpeg } from '../../../utils/utils';
import SearchForm from './SearchForm';
import type { LiveData, LiveInfo, LiveRoomInfo } from '../interface';

/**
 * 格式化m3u8文件内视频的地址
 * @param { string } data: m3u8文件内容
 */
function formatTsUrl(data: string): string {
  const dataArr: string[] = data.split('\n');
  const newStrArr: string[] = [];

  for (const item of dataArr) {
    if (/^\/fragments.*\.ts$/.test(item)) {
      newStrArr.push(`http://cychengyuan-vod.48.cn${ item }`);
    } else {
      newStrArr.push(item);
    }
  }

  return newStrArr.join('\n');
}

/* state */
type RSelector = Pick<L48InitialState, 'recordList' | 'recordNext' | 'recordChildList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 录播信息
  recordList: createSelector(
    ({ l48 }: { l48: L48InitialState }): Array<LiveInfo> => l48.recordList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  ),

  // 记录录播分页位置
  recordNext: createSelector(
    ({ l48 }: { l48: L48InitialState }): string => l48.recordNext,
    (data: string): string => data
  ),

  // 录播下载
  recordChildList: createSelector(
    ({ l48 }: { l48: L48InitialState }): Array<LiveChildItem> => l48.recordChildList,
    (data: Array<LiveChildItem>): Array<LiveChildItem> => data
  )
});

/* 录播列表 */
function Record(props: {}): ReactElement {
  const { recordList, recordNext, recordChildList }: RSelector = useSelector(state);
  const store: Store = useStore();
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading
  const [query, setQuery]: [string | undefined, D<S<string | undefined>>] = useState(undefined);
  const recordListQueryResult: Array<LiveInfo> = useMemo(function(): Array<LiveInfo> {
    if (query && !/^\s*$/.test(query)) {
      const regexp: RegExp = new RegExp(query, 'i');

      return recordList.filter((o: LiveInfo): boolean => regexp.test(o.userInfo.nickname));
    } else {
      return recordList;
    }
  }, [query, recordList]);

  // 搜索
  function onSubmit(value: FormStore): void {
    setQuery(value.q);
  }

  // 停止
  function handleStopClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(recordChildList, { id: record.liveId });

    if (index >= 0) {
      recordChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 停止后的回调函数
  function endCallback(record: LiveInfo): void {
    const list: Array<LiveChildItem> = [...store.getState().l48.recordChildList];
    const index: number = findIndex(list, { id: record.liveId });

    if (index >= 0) {
      list.splice(index, 1);
      dispatch(setRecordChildList([...list]));
    }
  }

  // 下载视频
  async function handleDownloadM3u8Click(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `${ record.userInfo.nickname }_${ record.liveId }.ts`
    });

    if (result.canceled || !result.filePath) return;

    const m3u8File: string = `${ result.filePath }.m3u8`;
    const m3u8Data: string = await requestDownloadFile(resInfo.content.playStreamPath);

    await fsP.writeFile(m3u8File, formatTsUrl(m3u8Data));

    const worker: Worker = new DownloadWorker();

    type EventData = {
      type: 'close' | 'error';
      error?: Error;
    };

    worker.addEventListener('message', function(event: MessageEvent<EventData>) {
      const { type, error }: EventData = event.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          message.error(`视频：${ record.title } 下载失败！`);
        }

        worker.terminate();
        endCallback(record);
      }
    }, false);

    worker.postMessage({
      type: 'start',
      playStreamPath: m3u8File,
      filePath: result.filePath,
      liveId: record.liveId,
      ffmpeg: getFFmpeg()
    });

    dispatch(setRecordChildList(
      recordChildList.concat([{
        id: record.liveId,
        worker
      }])
    ));
  }

  // 下载弹幕
  async function handleDownloadLrcClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const { base }: ParsedPath = path.parse(res.content.msgFilePath);
      const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
        defaultPath: base
      });

      if (result.canceled || !result.filePath) return;

      await requestDownloadFileByStream(res.content.msgFilePath, result.filePath);
      message.success('弹幕文件下载成功！');
    } catch (err) {
      message.error('弹幕文件下载失败！');
      console.error(err);
    }
  }

  // 加载列表
  async function handleLoadRecordListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      const res: LiveData = await requestLiveList(recordNext, false);
      const data: Array<LiveInfo> = recordList.concat(res.content.liveList);

      dispatch(setRecordList({
        next: res.content.next,
        data
      }));
    } catch (err) {
      message.error('录播列表加载失败！');
      console.error(err);
    }

    setLoading(false);
  }

  // 刷新列表
  async function handleRefreshLiveListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      const res: LiveData = await requestLiveList('0', false);

      dispatch(setRecordList({
        next: res.content.next,
        data: res.content.liveList
      }));
    } catch (err) {
      message.error('录播列表加载失败！');
      console.error(err);
    }

    setLoading(false);
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
      render: (value: 1 | 2, record: LiveInfo, index: number): ReactElement => value === 2
        ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag>
    },
    {
      title: '时间',
      dataIndex: 'ctime',
      render: (value: string, record: LiveInfo, index: number): string => {
        return moment(Number(value)).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        const idx: number = findIndex(recordChildList, { id: record.liveId });

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Button type="primary"
                  danger={ true }
                  onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                >
                  停止下载
                </Button>
              ) : (
                <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadM3u8Click(record, event) }>
                  下载视频
                </Button>
              )
            }

            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadLrcClick(record, event) }>
              下载弹幕
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
          <SearchForm onSubmit={ onSubmit } />
        </div>
        <div>
          <Button.Group>
            <Button onClick={ handleLoadRecordListClick }>加载列表</Button>
            <Button onClick={ handleRefreshLiveListClick }>刷新列表</Button>
          </Button.Group>
        </div>
      </header>
      <Table size="middle"
        columns={ columns }
        dataSource={ recordListQueryResult }
        bordered={ true }
        loading={ loading }
        rowKey="liveId"
        pagination={{
          showQuickJumper: true,
          showTotal: showTotalRender
        }}
      />
    </Fragment>
  );
}

export default Record;