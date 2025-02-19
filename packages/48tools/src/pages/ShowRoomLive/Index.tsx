import { setInterval, clearInterval } from 'node:timers';
import type { SaveDialogReturnValue } from 'electron';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Alert, Table, App, Popconfirm, Button, Checkbox, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { useAppProps } from 'antd/es/app/context';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { showSaveDialog } from '../../utils/remote/dialog';
import Header from '../../components/Header/Header';
import AddLiveRoomForm from '../../components/AddLiveRoomForm/AddLiveRoomForm';
import Content from '../../components/Content/Content';
import dbConfig from '../../utils/IDB/IDBConfig';
import {
  IDBCursorLiveList,
  IDBSaveLiveItem,
  IDBDeleteLiveItem,
  IDBSaveAutoRecordLiveItem,
  setAutoRecordTimer,
  selectorsObject
} from './reducers/showroomLive';
import ShowroomTextIcon from '../Index/ShowroomTextIcon/ShowroomTextIcon';
import { getFilePath } from '../../utils/utils';
import HelpButtonGroup from '../../components/HelpButtonGroup/HelpButtonGroup';
import { localStorageKey } from './function/helper';
import AutoRecordingSavePath from '../../components/AutoRecordingSavePath/AutoRecordingSavePath';
import showroomLiveWorker from './function/showroomLiveWorker';
import { showroomLiveAutoRecord } from './function/showroomLiveAutoRecord';
import type { LiveSliceInitialState, LiveSliceSelector } from '../../store/slice/LiveSlice';
import type { LiveItem, WebWorkerChildItem } from '../../commonTypes';

/* redux selector */
type RState = { showroomLive: LiveSliceInitialState };

const selector: Selector<RState, LiveSliceSelector> = createStructuredSelector({ ...selectorsObject });

/* showroom直播抓取 */
function Index(props: {}): ReactElement {
  const { liveList, workerList, autoRecordTimer }: LiveSliceSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();

  // 停止自动录制
  function handleAutoRecordStopClick(event: MouseEvent): void {
    clearInterval(autoRecordTimer!);
    dispatch(setAutoRecordTimer(null));
  }

  // 自动录制
  function handleAutoRecordStartClick(event: MouseEvent): void {
    const showroomLiveAutoRecordSavePath: string | null = localStorage.getItem(localStorageKey);

    if (showroomLiveAutoRecordSavePath) {
      dispatch(setAutoRecordTimer(setInterval(showroomLiveAutoRecord, 60_000)));
      showroomLiveAutoRecord();
    } else {
      messageApi.warning('请先配置视频自动保存的目录！');
    }
  }

  // 修改自动录制的checkbox
  function handleAutoRecordCheck(record: LiveItem, event: CheckboxChangeEvent): void {
    dispatch(IDBSaveAutoRecordLiveItem({
      data: { ...record, autoRecord: event.target.checked }
    }));
  }

  // 停止
  function handleStopClick(record: LiveItem, event?: MouseEvent): void {
    const index: number = workerList.findIndex((o: WebWorkerChildItem): boolean => o.id === record.id);

    if (index >= 0) {
      workerList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent): Promise<void> {
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: getFilePath({
        typeTitle: 'showroom-live',
        infoArray: [record.roomId, record.description],
        ext: 'ts'
      })
    });

    if (result.canceled || !result.filePath) return;

    showroomLiveWorker(record, messageApi, result.filePath);
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
      title: '自动录制',
      dataIndex: 'autoRecord',
      width: 100,
      render: (value: boolean, record: LiveItem, index: number): ReactElement => (
        <Checkbox checked={ value }
          disabled={ autoRecordTimer !== null }
          onChange={ (event: CheckboxChangeEvent): void => handleAutoRecordCheck(record, event) }
        />
      )
    },
    {
      title: '操作',
      key: 'handle',
      width: 175,
      render: (value: undefined, record: LiveItem, index: number): ReactElement => {
        const idx: number = workerList.findIndex((o: WebWorkerChildItem) => o.id === record.id);

        return (
          <Space.Compact>
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
      query: { indexName: dbConfig.objectStore[9].data[1] }
    }));
  }, []);

  return (
    <Content>
      <Header>
        <Space.Compact className="mr-[8px]">
          {
            autoRecordTimer === null
              ? <Button onClick={ handleAutoRecordStartClick }>自动录制</Button>
              : <Button type="primary" danger={ true } onClick={ handleAutoRecordStopClick }>停止录制</Button>
          }
          <AutoRecordingSavePath localStorageItemKey={ localStorageKey } />
        </Space.Compact>
        <HelpButtonGroup navId="showroom-live" tooltipTitle={ <Fragment>如何添加{ ShowroomTextIcon }的直播间ID</Fragment> }>
          <AddLiveRoomForm modalTitle={
            <Fragment>
              添加
              <span className="font-normal">{ ShowroomTextIcon }</span>
              直播间信息
            </Fragment>
          } IDBSaveDataFunc={ IDBSaveLiveItem } />
        </HelpButtonGroup>
      </Header>
      <Alert className="mb-[8px]" type="warning" message="录制时需要开启VPN，使用Tun（虚拟网卡）模式代理最佳。" />
      <Table size="middle"
        columns={ columns }
        dataSource={ liveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[9].key }
        pagination={{
          showQuickJumper: true
        }}
      />
    </Content>
  );
}

export default Index;