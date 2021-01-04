import * as path from 'path';
import { ParsedPath } from 'path';
import { remote, OpenDialogReturnValue } from 'electron';
import { useRef, ReactElement, ComponentClass, MouseEvent, RefObject } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, List } from 'antd';
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
import style from './index.sass';
import Content from '../../components/Content/Content';
import Header from '../../components/Header/Header';
import { setConcatListAdd, setConcatList, ConcatInitialState } from './reducers/reducers';
import { rStr } from '../../utils/utils';
import type { ConcatItem } from './types';

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

/* state */
type RSelector = Pick<ConcatInitialState, 'concatList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 视频合并列表
  concatList: createSelector(
    ({ concat }: { concat: ConcatInitialState }): Array<ConcatItem> => concat.concatList,
    (data: Array<ConcatItem>): Array<ConcatItem> => data
  )
});

/* 视频合并 */
function Index(props: {}): ReactElement {
  const { concatList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();
  const divRef: RefObject<HTMLDivElement> = useRef(null);

  // 拖拽挂载
  function helperContainer(): HTMLDivElement {
    return divRef.current!.querySelector<HTMLDivElement>('.ant-list-items')!;
  }

  // 获取ref
  function divRefCallback(r: any): void {
    // @ts-ignore
    divRef['current'] = r?.container ?? null;
  }

  // 拖拽完毕
  function handleDragSortEnd(sort: SortEnd, event: SortEvent): void {
    dispatch(setConcatList(arrayMove(concatList, sort.oldIndex, sort.newIndex)));
  }

  // 选择视频
  async function handleSelectVideosClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
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

  // 渲染单个组件
  function renderItem(item: ConcatItem, index: number): ReactElement {
    return (
      <ListItem key={ item.id } index={ index }>
        <List.Item key={ item.id }
          className={ style.helperItem }
          actions={ [<Button key="delete" size="small" type="primary" danger={ true }>删除</Button>] }
        >
          <DragHandleComponent />
          { index + 1 }、{ item.filename }
        </List.Item>
      </ListItem>
    );
  }

  return (
    <Content>
      <Header>
        <Button.Group>
          <Button icon={ <IconFileFilled /> } onClick={ handleSelectVideosClick }>视频选择</Button>
          <Button>清空视频</Button>
          <Button type="primary">开始合并</Button>
        </Button.Group>
      </Header>
      <div className={ style.container }>
        <ListContainer ref={ divRefCallback }
          useDragHandle={ true }
          helperContainer={ helperContainer }
          onSortEnd={ handleDragSortEnd }
        >
          <List dataSource={ concatList } renderItem={ renderItem } bordered={ true } />
        </ListContainer>
      </div>
    </Content>
  );
}

export default Index;