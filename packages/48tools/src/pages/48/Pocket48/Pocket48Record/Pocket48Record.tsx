import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import { promises as fsP } from 'node:fs';
import { clipboard, type SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import {
  Fragment,
  useState,
  useMemo,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, type Selector } from 'reselect';
import { Button, message, Table, Tag, Select, Form, InputNumber, Space, Popconfirm, Popover } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form';
import type { Store as FormStore } from 'antd/es/form/interface';
import * as dayjs from 'dayjs';
import filenamify from 'filenamify/browser';
import style from './pocket48Record.sass';
import getRecordVideoDownloadWorker from './RecordVideoDownload.worker/getRecordVideoDownloadWorker';
import getFFMpegDownloadWorker from '../../../../utils/worker/getFFMpegDownloadWorker';
import Header from '../../../../components/Header/Header';
import {
  setRecordList,
  setAddRecordChildList,
  setDeleteRecordChildList,
  setRecordFields,
  type Pocket48InitialState
} from '../../reducers/pocket48';
import {
  requestLiveList,
  requestLiveRoomInfo,
  requestDownloadFileByStream,
  requestDownloadFile
} from '../../services/pocket48';
import { getFFmpeg, getFileTime } from '../../../../utils/utils';
import SearchForm from './SearchForm';
import downloadImages from '../Pocket48Live/downloadImages/downloadImages';
import type { RecordFieldData, RecordVideoDownloadWebWorkerItem } from '../../types';
import type { MessageEventData } from '../../../../types';
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
      newStrArr.push(`https://cychengyuan-vod.48.cn${ item }`);
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
    (recordList: Array<LiveInfo>): Array<LiveInfo> => recordList
  ),
  // 记录录播分页位置
  recordNext: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): string => pocket48.recordNext,
    (recordNext: string): string => recordNext
  ),
  // 录播下载
  recordChildList: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<RecordVideoDownloadWebWorkerItem> => pocket48.recordChildList,
    (recordChildList: Array<RecordVideoDownloadWebWorkerItem>): Array<RecordVideoDownloadWebWorkerItem> => recordChildList
  ),
  // 表单field
  recordFields: createSelector(
    ({ pocket48 }: { pocket48: Pocket48InitialState }): Array<RecordFieldData> => pocket48.recordFields,
    (recordFields: Array<RecordFieldData>): Array<RecordFieldData> => recordFields
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
    const index: number = recordChildList.findIndex((o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);

    if (index >= 0) {
      recordChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 重试（主要是下载ts碎片）
  function handleRetryDownloadClick(record: LiveInfo, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = recordChildList.findIndex((o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);

    if (index >= 0) {
      recordChildList[index].worker.postMessage({ type: 'retry' });
      message.info('正在重新下载ts片段。');
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

  /**
   * 下载视频
   * @param { LiveInfo } record
   * @param { 0 | 1 } downloadType: 下载方式。0：正常下载，1：拼碎片
   * @param { MouseEvent<HTMLButtonElement> } event
   */
  async function handleDownloadM3u8Click(
    record: LiveInfo,
    downloadType: 0 | 1,
    event: MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    try {
      const resInfo: LiveRoomInfo = await requestLiveRoomInfo(record.liveId);
      const parseResult: ParsedPath = path.parse(resInfo.content.playStreamPath);
      const isM3u8: boolean = parseResult.ext === '.m3u8'; // 以前的视频可能是mp4的

      const result: SaveDialogReturnValue = await dialog.showSaveDialog({
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

        const m3u8Data: string = await requestDownloadFile(resInfo.content.playStreamPath);

        await fsP.writeFile(m3u8File, formatTsUrl(m3u8Data)); // 写入m3u8文件
        downloadFile = m3u8File;                              // m3u8文件地址
      } else {
        downloadFile = resInfo.content.playStreamPath;
      }

      const worker: Worker = (isM3u8 && downloadType === 1 ? getRecordVideoDownloadWorker : getFFMpegDownloadWorker)();

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
        playStreamPath: downloadFile,
        filePath: result.filePath,
        ffmpeg: getFFmpeg(),
        protocolWhitelist: isM3u8
      });

      dispatch(setAddRecordChildList({
        id: record.liveId,
        worker,
        isM3u8,
        downloadType
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

      if (res.content.msgFilePath === '') {
        return message.warn('弹幕文件不存在！');
      }

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
      width: 410,
      className: style.textRight,
      render: (value: undefined, record: LiveInfo, index: number): ReactElement => {
        const idx: number = recordChildList.findIndex(
          (o: RecordVideoDownloadWebWorkerItem): boolean => o.id === record.liveId);
        const item: RecordVideoDownloadWebWorkerItem | undefined = idx >= 0 ? recordChildList[idx] : undefined,
          canRetry: boolean | undefined = item && item.downloadType === 1;

        return (
          <Button.Group>
            {
              idx >= 0 ? (
                <Popconfirm title="确定要停止下载吗？"
                  onConfirm={ (event: MouseEvent<HTMLButtonElement>): void => handleStopClick(record, event) }
                >
                  {
                    canRetry ? (
                      <Popover content={
                        <Fragment>
                          <p className={ style.smallText }>
                            正在使用备用方案下载视频。<br />
                            如果下载时发现卡住了，可以使用重试
                          </p>
                          <div className={ style.textRight }>
                            <Button size="small" onClick={
                              (event: MouseEvent<HTMLButtonElement>): void => handleRetryDownloadClick(record, event)
                            }>
                              重试
                            </Button>
                          </div>
                        </Fragment>
                      } placement="left">
                        <Button type="primary" danger={ true }>停止下载</Button>
                      </Popover>
                    ) : <Button type="primary" danger={ true }>停止下载</Button>
                  }
                </Popconfirm>
              ) : (
                <Popover content={
                  <Fragment>
                    <p className={ style.smallText }>
                      如果下载下来只有m3u8文件，<br />
                      使用该方式重新下载视频
                    </p>
                    <div className={ style.textRight }>
                      <Button size="small" onClick={
                        (event: MouseEvent<HTMLButtonElement>): Promise<void> =>
                          handleDownloadM3u8Click(record, 1, event)
                      }>
                        使用备用方案下载视频
                      </Button>
                    </div>
                  </Fragment>
                } placement="left">
                  <Button onClick={
                    (event: MouseEvent<HTMLButtonElement>): Promise<void> =>
                      handleDownloadM3u8Click(record, 0, event)
                  }>
                    下载视频
                  </Button>
                </Popover>
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