import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import { promises as fsP } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, List, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { FileFilled as IconFileFilled } from '@ant-design/icons';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { arrayMoveImmutable } from 'array-move';
import { showOpenDialog, showSaveDialog } from '../../../utils/remote/dialog';
import getConcatVideoWorker from './function/concatVideo.worker/getConcatVideoWorker';
import Header from '../../../components/Header/Header';
import { setConcatListAdd, setConcatList, setConcatListDelete, setConcatWorker, type ConcatInitialState } from '../reducers/concat';
import { getFFmpeg, getFilePath } from '../../../utils/utils';
import RenderListItem from './RenderListItem';
import type { MessageEventData } from '../../../commonTypes';
import type { ConcatItem } from '../types';

/* redux selector */
type RState = { concat: ConcatInitialState };

const selector: Selector<RState, ConcatInitialState> = createStructuredSelector({
  // 视频合并列表
  concatList: ({ concat }: RState): Array<ConcatItem> => concat.concatList,

  // 合并线程
  concatWorker: ({ concat }: RState): Worker | null => concat.concatWorker
});

/* 视频合并 */
function Concat(props: {}): ReactElement {
  const { concatList, concatWorker }: ConcatInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 停止合并
  function handleStopConcatVideoClick(event: MouseEvent): void {
    concatWorker?.postMessage({ type: 'stop' });
  }

  // 视频合并
  async function handleConcatVideoClick(event: MouseEvent): Promise<void> {
    if (!concatList?.length) return;

    const pathResult: ParsedPath = path.parse(concatList[0].value);
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: getFilePath({
        typeTitle: '视频合并',
        infoArray: ['video-length', concatList.length],
        ext: pathResult.ext
      })
    });

    if (result.canceled || !result.filePath) return;

    // 写txt文件
    const txt: string = concatList.map((o: ConcatItem): string => `file '${ o.value }'`).join('\n');
    const txtFile: string = `${ result.filePath }.txt`;

    await fsP.writeFile(txtFile, txt);

    // 合并文件
    const worker: Worker = getConcatVideoWorker();

    worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
      const { type, error }: MessageEventData = event1.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          messageApi.error('视频合并失败！');
        }

        worker.terminate();
        dispatch(setConcatWorker(null));
      }
    }, false);

    worker.postMessage({
      type: 'start',
      textPath: txtFile,
      filePath: result.filePath,
      ffmpeg: getFFmpeg()
    });

    dispatch(setConcatWorker(worker));
  }

  // 拖拽完毕
  function handleDragSortEnd(event: DragEndEvent): void {
    const oldIndex: number | undefined = event.active?.data?.current?.index;
    const newIndex: number | undefined = event.over?.data?.current?.index;

    if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
      dispatch(setConcatList(arrayMoveImmutable(concatList, oldIndex, newIndex)));
    }
  }

  // 选择视频
  async function handleSelectVideosClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openFile', 'multiSelections'] });

    if (result.canceled || !(result?.filePaths?.length)) return;

    const list: Array<ConcatItem> = result.filePaths.map((o: string): ConcatItem => {
      const pathResult: ParsedPath = path.parse(o);

      return {
        value: o,
        id: randomUUID(),
        filename: pathResult.base
      };
    });

    dispatch(setConcatListAdd(list));
  }

  // 删除
  function handleDeleteItemClick(item: ConcatItem, event: MouseEvent): void {
    dispatch(setConcatListDelete(item));
  }

  // 清空视频
  function handleClearAllListClick(event: MouseEvent): void {
    dispatch(setConcatList([]));
  }

  // 渲染单个组件
  function renderItem(item: ConcatItem, index: number): ReactElement {
    return <RenderListItem item={ item } index={ index } onDeleteItem={ handleDeleteItemClick } />;
  }

  return (
    <Fragment>
      <Header>
        <Button.Group>
          <Button icon={ <IconFileFilled /> } onClick={ handleSelectVideosClick }>视频选择</Button>
          <Button onClick={ handleClearAllListClick }>清空视频</Button>
          {
            concatWorker
              ? <Button type="primary" danger={ true } onClick={ handleStopConcatVideoClick }>停止合并</Button>
              : <Button type="primary" onClick={ handleConcatVideoClick }>开始合并</Button>
          }
        </Button.Group>
      </Header>
      <div className="relative" id="container">
        <DndContext onDragEnd={ handleDragSortEnd }>
          <SortableContext items={ concatList }>
            <List dataSource={ concatList } renderItem={ renderItem } bordered={ true } />
          </SortableContext>
        </DndContext>
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

export default Concat;