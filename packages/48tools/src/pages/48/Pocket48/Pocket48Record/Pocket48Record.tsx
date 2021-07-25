import * as path from 'path';
import type { ParsedPath } from 'path';
import { promises as fsP } from 'fs';
import { clipboard, SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, useState, useMemo, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, message, Table, Tag, Select, Form, InputNumber, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form';
import type { Store as FormStore } from 'antd/es/form/interface';
import { findIndex } from 'lodash-es';
import * as dayjs from 'dayjs';
import * as filenamify from 'filenamify';
import FFMpegDownloadWorker from 'worker-loader!../../../../utils/worker/FFMpegDownload.worker';
import style from './pocket48Record.sass';
import Header from '../../../../components/Header/Header';
import {
  setRecordList,
  setAddRecordChildList,
  setDeleteRecordChildList,
  setRecordFields,
  Pocket48InitialState
} from '../../reducers/pocket48';
import { requestLiveList, requestLiveRoomInfo, requestDownloadFileByStream, requestDownloadFile } from '../../services/pocket48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import SearchForm from './SearchForm';
import downloadImages from '../Pocket48Live/downloadImages/downloadImages';
import type { RecordFieldData } from '../../types';
import type { WebWorkerChildItem, MessageEventData } from '../../../../types';
import type { LiveData, LiveInfo, LiveRoomInfo } from '../../services/interface';

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

/* redux selector */
type RSelector = Pick<Pocket48InitialState, 'recordList' | 'recordNext' | 'recordChildList' | 'recordFields'>;

const selector: Selector<any, RSelector> = createStructuredSelector({
  // 录播信息
  recordList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<LiveInfo> => pocket48.recordList,
    (data: Array<LiveInfo>): Array<LiveInfo> => data
  ),
  // 记录录播分页位置
  recordNext: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): string => pocket48.recordNext,
    (data: string): string => data
  ),
  // 录播下载
  recordChildList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<WebWorkerChildItem> => pocket48.recordChildList,
    (data: Array<WebWorkerChildItem>): Array<WebWorkerChildItem> => data
  ),
  // 表单field
  recordFields: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<RecordFieldData> => pocket48.recordFields,
    (data: Array<RecordFieldData>): Array<RecordFieldData> => data
  )
});

/* 录播列表 */
function Pocket48Record(props: {}): ReactElement {
  const { recordList, recordNext, recordChildList, recordFields }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载loading
  const [query, setQuery]: [string | undefined, D<S<string | undefined>>] = useState(undefined);
  const [form]: [FormInstance] = Form.useForm();
  const recordListQueryResult: Array<LiveInfo> = useMemo(function(): Array<LiveInfo> {
    if (query && !/^\s*$/.test(query)) {
      const regexp: RegExp = new RegExp(query, 'i');

      return recordList.filter((o: LiveInfo): boolean => regexp.test(o.userInfo.nickname));
    } else {
      return recordList;
    }
  }, [query, recordList]);

  // 表单的onFieldsChange事件
  function handleFormFieldsChange(changedFields: RecordFieldData[], allFields: RecordFieldData[]): void {
    dispatch(setRecordFields(allFields));
  }

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

  // 下载视频
  async function handleDownloadM3u8Click(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
        defaultPath: `[口袋48录播]${ record.userInfo.nickname }_${ filenamify(record.title) }`
          + `@${ getFileTime(record.ctime) }__${ getFileTime() }.ts`
      });

      if (result.canceled || !result.filePath) return;

      const m3u8File: string = `${ result.filePath }.m3u8`;
      const m3u8Data: string = await requestDownloadFile(resInfo.content.playStreamPath);

      await fsP.writeFile(m3u8File, formatTsUrl(m3u8Data));

      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event1.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`视频：${ record.title } 下载失败！`);
          }

          worker.terminate();
          dispatch(setDeleteRecordChildList(record));
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: m3u8File,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        protocolWhitelist: true
      });

      dispatch(setAddRecordChildList({
        id: record.liveId,
        worker
      }));
    } catch (err) {
      console.error(err);
      message.error('录播下载失败！');
    }
  }

  // 下载弹幕
  async function handleDownloadLrcClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const time: string = getFileTime(record.ctime);
      const { ext }: ParsedPath = path.parse(res.content.msgFilePath);
      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
        defaultPath: `[口袋48弹幕]${ record.userInfo.nickname }_${ filenamify(record.title) }_${ time }${ ext }`
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
      const { groupId, userId }: { groupId?: number | 'all'; userId?: string | number | undefined } = form.getFieldsValue();
      const res: LiveData = await requestLiveList(recordNext, false, groupId, userId);
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
      const { groupId, userId }: { groupId?: number | 'all'; userId?: string | number | undefined } = form.getFieldsValue();
      const res: LiveData = await requestLiveList('0', false, groupId, userId);

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
        return dayjs(Number(value)).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 420,
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        const idx: number = findIndex(recordChildList, { id: record.liveId });

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止下载吗？"
                  onConfirm={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                >
                  <Button type="primary" danger={ true }>停止下载</Button>
                </Popconfirm>
              ) : (
                <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadM3u8Click(record, event) }>
                  下载视频
                </Button>
              )
            }

            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadLrcClick(record, event) }>
              下载弹幕
            </Button>
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleDownloadImagesClick(record, event) }>
              下载图片
            </Button>
            <Button onClick={ (event: MouseEvent<HTMLButtonElement>): Promise<void> => handleCopyLiveUrlClick(record, event) }>
              复制录播地址
            </Button>
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <SearchForm onSubmit={ onSubmit } />
        {/* 队伍和当前人的搜索 */}
        <Form className={ style.form } form={ form } fields={ recordFields } onFieldsChange={ handleFormFieldsChange }>
          <Space size={ 0 }>
            <Form.Item name="groupId" noStyle={ true }>
              <Select className={ style.groupSelect }>
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value={ 19 }>明星殿堂</Select.Option>
                <Select.Option value={ 17 }>THE9</Select.Option>
                <Select.Option value={ 18 }>硬糖少女303</Select.Option>
                <Select.Option value={ 20 }>丝芭影视</Select.Option>
                <Select.Option value={ 10 }>SNH48</Select.Option>
                <Select.Option value={ 11 }>BEJ48</Select.Option>
                <Select.Option value={ 12 }>GNZ48</Select.Option>
                <Select.Option value={ 14 }>CKG48</Select.Option>
                <Select.Option value={ 15 }>IDFT</Select.Option>
                <Select.Option value={ 16 }>海外练习生</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="userId" noStyle={ true }>
              <InputNumber className={ style.userIdInput } placeholder="请输入成员ID" />
            </Form.Item>
            <Button.Group>
              <Button type="primary" onClick={ handleLoadRecordListClick }>加载列表</Button>
              <Button onClick={ handleRefreshLiveListClick }>刷新列表</Button>
            </Button.Group>
          </Space>
        </Form>
      </Header>
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

export default Pocket48Record;