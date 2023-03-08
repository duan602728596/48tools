import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, message, Divider } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import Header from '../../../components/Header/Header';
import EditModal from './EditModal/EditModal';
import ProcessItemRender from './ProcessItemRender/ProcessItemRender';
import {
  setAddProcess,
  setUpdateProcess,
  ffmpegProcessListSelectors,
  type FFmpegProcessInitialState
} from '../reducers/FFmpegProcess';
import getFFmpegChildProcessWorker from './function/FFmpegChildProcessWorker/getFFmpegChildProcessWorker';
import { getFFmpeg, rStr } from '../../../utils/utils';
import type { ProcessItem, ProcessItemConsole } from '../types';
import type { MessageEventData, ProgressMessageEventData } from './function/FFmpegChildProcessWorker/FFmpegChildProcess.worker';

/* redux selector */
type RSelector = { FFmpegProcessList: Array<ProcessItem> };
type RState = { FFmpegProcess: FFmpegProcessInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 执行列表
  FFmpegProcessList: ({ FFmpegProcess: FP }: RState): Array<ProcessItem> => ffmpegProcessListSelectors.selectAll(FP)
});

/* ffmpeg直接调用 */
function FFmpegProcess(props: {}): ReactElement {
  const { FFmpegProcessList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [editModalOpen, setEditModalOpen]: [boolean, D<S<boolean>>] = useState(false);

  /* 执行worker的函数 */
  function runWorker(item: Pick<ProcessItem, 'id' | 'args'>): Worker {
    const worker: Worker = getFFmpegChildProcessWorker();
    let consoleArray: Array<ProcessItemConsole> | null = [];

    worker.addEventListener('message', function(workerEvent: MessageEvent<MessageEventData>): void {
      if (workerEvent.data.type === 'message') {
        requestIdleCallback((): void => {
          if (consoleArray) {
            consoleArray = consoleArray.concat([{
              text: (workerEvent.data as ProgressMessageEventData).data,
              key: rStr(10)
            }]);
            dispatch(setUpdateProcess({
              id: item.id,
              changes: { console: consoleArray }
            }));
          }
        });
      } else {
        worker.terminate();
        consoleArray = null;
        dispatch(setUpdateProcess({
          id: item.id,
          changes: {
            status: workerEvent.data.type === 'error' ? 'error' : 'stop',
            worker: undefined
          }
        }));
      }
    });

    worker.postMessage({
      type: 'start',
      ffmpeg: getFFmpeg(),
      item
    });

    return worker;
  }

  // 重新执行
  function handleReStart(item: ProcessItem): void {
    const worker: Worker = runWorker(item);

    dispatch(setUpdateProcess({
      id: item.id,
      changes: {
        status: 'running',
        console: [],
        worker
      }
    }));
    messageApi.info('开始执行。');
  }

  // 确认
  function handleOk(value: { args: string }): void {
    const item: Pick<ProcessItem, 'id' | 'args'> = {
      id: randomUUID(),
      args: value.args
    };
    const worker: Worker = runWorker(item);

    dispatch(setAddProcess({
      ...item,
      status: 'running',
      console: [],
      worker
    }));
    messageApi.info('开始执行。');
  }

  // 渲染列表
  function FFmpegProcessListRender(): Array<ReactElement> {
    return FFmpegProcessList.map((item: ProcessItem, index: number): ReactElement => {
      return <ProcessItemRender key={ item.id } index={ index } item={ item } onReStart={ handleReStart } />;
    });
  }

  return (
    <Fragment>
      <Header>
        <Button onClick={ (event: MouseEvent): void => setEditModalOpen(true) }>执行FFmpeg命令</Button>
      </Header>
      <Divider />
      { FFmpegProcessListRender() }
      <EditModal open={ editModalOpen }
        onOk={ handleOk }
        onCancel={ (event: MouseEvent): void => setEditModalOpen(false) }
      />
      { messageContextHolder }
    </Fragment>
  );
}

export default FFmpegProcess;