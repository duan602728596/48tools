import { remote, SaveDialogReturnValue } from 'electron';
import { Fragment, ReactElement, useEffect, MouseEvent } from 'react';
import { observer, Observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Button, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { findIndex } from 'lodash';
import * as moment from 'moment';
import FFMpegDownloadWorker from 'worker-loader!../../../utils/worker/FFMpegDownload.Worker';
import type { MessageEventData } from '../../../utils/worker/FFMpegDownload.Worker';
import style from '../../48/index.sass';
import bilibiliStore from '../models/bilibili';
import AddForm from './AddForm';
import dbConfig from '../../../utils/idb/dbConfig';
import { requestRoomInitData, requestRoomPlayerUrl } from '../services/live';
import { getFFmpeg } from '../../../utils/utils';
import type { LiveItem } from '../types';
import type { RoomInit, RoomPlayUrl } from '../interface';

/* 直播抓取 */
function Live(props: {}): ReactElement {
  const {
    bilibiliLiveList,
    liveChildList,
    dbQueryAllLiveList,
    dbDeleteLiveListData,
    setAddLiveChildList,
    setDeleteLiveChildList
  }: typeof bilibiliStore = bilibiliStore;

  // 停止
  function handleStopClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    const index: number = findIndex(liveChildList, { id: record.id });

    if (index >= 0) {
      liveChildList[index].worker.postMessage({ type: 'stop' });
    }
  }

  // 停止后的回调函数
  function endCallback(record: LiveItem): void {
    setDeleteLiveChildList(record);
  }

  // 开始录制
  async function handleRecordClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const time: string = moment().format('YYYY_MM_DD_HH_mm_ss');
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `${ record.roomId }_${ time }.flv`
    });

    if (result.canceled || !result.filePath) return;

    try {
      const resInit: RoomInit = await requestRoomInitData(record.roomId);
      const resPlayUrl: RoomPlayUrl = await requestRoomPlayerUrl(`${ resInit.data.room_id }`);
      const worker: Worker = new FFMpegDownloadWorker();

      worker.addEventListener('message', function(event: MessageEvent<MessageEventData>) {
        const { type, error }: MessageEventData = event.data;

        if (type === 'close' || type === 'error') {
          if (type === 'error') {
            message.error(`${ record.description }[${ record.roomId }]录制失败！`);
          }

          worker.terminate();
          endCallback(record);
        }
      }, false);

      worker.postMessage({
        type: 'start',
        playStreamPath: resPlayUrl.data.durl[0].url,
        filePath: result.filePath,
        id: record.id,
        ffmpeg: getFFmpeg(),
        ua: true
      });

      setAddLiveChildList({
        id: record.id,
        worker
      });
    } catch (err) {
      console.error(err);
      message.error('录制失败！');
    }
  }

  // 删除
  function handleDeleteRoomIdClick(record: LiveItem, event: MouseEvent<HTMLButtonElement>): void {
    dbDeleteLiveListData(record);
  }

  const columns: ColumnsType<LiveItem> = [
    { title: '说明', dataIndex: 'description' },
    { title: '房间ID', dataIndex: 'roomId' },
    {
      title: '操作',
      key: 'handle',
      width: 155,
      render: (value: undefined, record: LiveItem, index: number): ReactElement => (
        <Button.Group>
          <Observer>
            {
              (): ReactElement => {
                const idx: number = findIndex(liveChildList, { id: record.id });

                return (
                  <Fragment>
                    {
                      idx >= 0 ? (
                        <Button type="primary"
                          danger={ true }
                          onClick={ (event: MouseEvent<HTMLButtonElement> ): void => handleStopClick(record, event) }
                        >
                          停止录制
                        </Button>
                      ) : (
                        <Button onClick={ (event: MouseEvent<HTMLButtonElement> ): Promise<void> => handleRecordClick(record, event) }>
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
                  </Fragment>
                );
              }
            }
          </Observer>
        </Button.Group>
      )
    }
  ];

  useEffect(function(): void {
    dbQueryAllLiveList();
  }, []);

  return (
    <Fragment>
      <header className={ style.header }>
        <div className={ style.headerLeft }>
          <Link to="/">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </div>
        <div>
          <AddForm />
        </div>
      </header>
      <Table size="middle"
        columns={ columns }
        dataSource={ bilibiliLiveList }
        bordered={ true }
        rowKey={ dbConfig.objectStore[0].key }
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default observer(Live);