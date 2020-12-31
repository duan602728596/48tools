import { Fragment, ReactElement } from 'react';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Select, Button } from 'antd';
import style from './inVideo.sass';
import Header from '../../../../components/Header/Header';
import { setInVideoQuery, setInVideoList, Live48InitialState } from '../../reducers/live48';
import type { InVideoQuery, InVideoItem } from '../../types';

/* state */
type RSelector = Pick<Live48InitialState, 'inVideoQuery' | 'inVideoList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 查询条件
  inVideoQuery: createSelector(
    ({ live48 }: { live48: Live48InitialState }): InVideoQuery | undefined => live48?.inVideoQuery,
    (data: InVideoQuery): InVideoQuery | undefined => data
  ),
  // 录播列表
  inVideoList: createSelector(
    ({ live48 }: { live48: Live48InitialState }): Array<InVideoItem> => live48.inVideoList,
    (data: Array<InVideoItem>): Array<InVideoItem> => data
  )
});

/* 录播下载 */
function InVideo(props: {}): ReactElement {
  return (
    <Fragment>
      <Header>
        <Select className={ style.typeSelect }>
          <Select.Option value="snh48">SNH48</Select.Option>
          <Select.Option value="bej48">BEJ48</Select.Option>
          <Select.Option value="gnz48">GNZ48</Select.Option>
          <Select.Option value="ckg48">CKG48</Select.Option>
        </Select>
        <Button>加载录播</Button>
      </Header>
    </Fragment>
  );
}

export default InVideo;