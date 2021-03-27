import * as path from 'path';
import type { ParsedPath } from 'path';
import { promises as fsP } from 'fs';
import type { OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { Fragment, ReactElement, ComponentClass, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, List, message } from 'antd';
import { FileFilled as IconFileFilled, MenuOutlined as IconMenuOutlined } from '@ant-design/icons';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortableContainerProps,
  SortableElementProps,
  SortEnd,
  SortEvent
} from 'react-sortable-hoc';
import * as arrayMove from 'array-move';
import * as dayjs from 'dayjs';
import ConcatVideoWorker from 'worker-loader!./concatVideo.worker';
import style from './concat.sass';
import Header from '../../../components/Header/Header';
import {
  setConcatListAdd,
  setConcatList,
  setConcatListDelete,
  setConcatWorker,
  ConcatInitialState
} from '../reducers/concat';
import { getFFmpeg, rStr } from '../../../utils/utils';
import type { MessageEventData } from '../../../types';
import type { ConcatItem } from '../types';

/* 拖拽组件 */
type WrappedComponentProps = { children: ReactElement };

const DragHandleComponent: ComponentClass = SortableHandle(
  (): ReactElement => <IconMenuOutlined className={ style.moveIcon } />);

const ListContainer: ComponentClass<WrappedComponentProps & SortableContainerProps> = SortableContainer(
  function(props: WrappedComponentProps & SortableContainerProps): ReactElement {
    return props.children;
  });

const ListItem: ComponentClass<WrappedComponentProps & SortableElementProps> = SortableElement(
  function(props: WrappedComponentProps & SortableElementProps): ReactElement {
    return props.children;
  });

/* redux selector */
const selector: Selector<any, ConcatInitialState> = createStructuredSelector({
  // 视频合并列表
  concatList: createSelector(
    ({ concat }: { concat: ConcatInitialState }): Array<ConcatItem> => concat.concatList,
    (data: Array<ConcatItem>): Array<ConcatItem> => data
  ),
  // 合并线程
  concatWorker: createSelector(
    ({ concat }: { concat: ConcatInitialState }): Worker | null => concat.concatWorker,
    (data: Worker | null): Worker | null => data
  )
});

/* 视频合并 */
function Concat(props: {}): ReactElement {
  const { concatList, concatWorker }: ConcatInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();

  // 停止合并
  function handleStopConcatVideoClick(event: MouseEvent<HTMLButtonElement>): void {
    concatWorker?.postMessage({ type: 'stop' });
  }

  // 视频合并
  async function handleConcatVideoClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    if (!concatList?.length) return;

    const pathResult: ParsedPath = path.parse(concatList[0].value);
    const time: string = dayjs().format('YYYY_MM_DD_HH_mm_ss');
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: `[视频合并]${ time }${ pathResult.ext }`
    });

    if (result.canceled || !result.filePath) return;

    // 写txt文件
    const txt: string = concatList.map((o: ConcatItem): string => `file '${ o.value }'`).join('\n');
    const txtFile: string = `${ result.filePath }.txt`;

    await fsP.writeFile(txtFile, txt);

    // 合并文件
    const worker: Worker = new ConcatVideoWorker();

    worker.addEventListener('message', function(event1: MessageEvent<MessageEventData>): void {
      const { type, error }: MessageEventData = event1.data;

      if (type === 'close' || type === 'error') {
        if (type === 'error') {
          message.error('视频合并失败！');
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

  // 拖拽挂载
  function helperContainer(): HTMLDivElement {
    return document.getElementById('container')!.querySelector<HTMLDivElement>('.ant-list-items')!;
  }

  // 拖拽完毕
  function handleDragSortEnd(sort: SortEnd, event: SortEvent): void {
    dispatch(setConcatList(arrayMove(concatList, sort.oldIndex, sort.newIndex)));
  }

  // 选择视频
  async function handleSelectVideosClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    });

    if (result.canceled || !(result?.filePaths?.length)) return;

    const list: Array<ConcatItem> = result.filePaths.map((o: string): ConcatItem => {
      const pathResult: ParsedPath = path.parse(o);

      return {
        value: o,
        id: rStr(10),
        filename: pathResult.base
      };
    });

    dispatch(setConcatListAdd(list));
  }

  // 删除
  function handleDeleteItemClick(item: ConcatItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setConcatListDelete(item));
  }

  // 清空视频
  function handleClearAllListClick(event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setConcatList([]));
  }

  // 渲染单个组件
  function renderItem(item: ConcatItem, index: number): ReactElement {
    return (
      <ListItem key={ item.id } index={ index }>
        <List.Item key={ item.id }
          className={ style.helperItem }
          actions={ [
            <Button key="delete"
              size="small"
              type="primary"
              danger={ true }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteItemClick(item, event) }
            >
              删除
            </Button>
          ] }
        >
          <DragHandleComponent />
          { index + 1 }、{ item.filename }
        </List.Item>
      </ListItem>
    );
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
      <div className={ style.container } id="container">
        <ListContainer useDragHandle={ true }
          helperContainer={ helperContainer }
          onSortEnd={ handleDragSortEnd }
        >
          <List dataSource={ concatList } renderItem={ renderItem } bordered={ true } />
        </ListContainer>
      </div>
    </Fragment>
  );
}

export default Concat;