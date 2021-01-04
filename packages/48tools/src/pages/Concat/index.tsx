import { remote, OpenDialogReturnValue } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button } from 'antd';
import { FileFilled as IconFileFilled } from '@ant-design/icons';
import Content from '../../components/Content/Content';
import Header from '../../components/Header/Header';
import { setConcatListAdd, ConcatInitialState } from './reducers/reducers';
import { rStr } from '../../utils/utils';
import type { ConcatItem } from './types';

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

  // 选择视频
  async function handleSelectVideosClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    });

    if (result.canceled || !(result?.filePaths?.length)) return;

    const list: Array<ConcatItem> = result.filePaths.map((o: string): ConcatItem => ({
      value: o,
      id: rStr(10)
    }));

    dispatch(setConcatListAdd(list));
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
    </Content>
  );
}

export default Index;