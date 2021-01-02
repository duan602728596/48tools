import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Select, Button, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from './inVideo.sass';
import Header from '../../../../components/Header/Header';
import { setInVideoQuery, setInVideoList, Live48InitialState } from '../../reducers/live48';
import { parseInVideoUrl } from '../parseLive48Website';
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
  const { inVideoQuery, inVideoList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 查询
  function handleLiveTypeSelect(value: string): void {
    dispatch(setInVideoQuery({
      liveType: value
    }));
  }

  // 页码变化
  async function handlePageChange(page: number, pageSize: number): Promise<void> {
    setLoading(true);

    try {
      const res: {
        data: Array<InVideoItem>;
        total: number;
      } = await parseInVideoUrl(inVideoQuery, page);

      dispatch(setInVideoList({
        data: res.data,
        page,
        total: res.total
      }));
    } catch (err) {
      console.error(err);
      message.error('录播加载失败！');
    }

    setLoading(false);
  }

  // 解析并加载列表
  async function handleGetVideoListClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    setLoading(true);

    try {
      const res: {
        data: Array<InVideoItem>;
        total: number;
      } = await parseInVideoUrl(inVideoQuery, 1);

      dispatch(setInVideoList({
        data: res.data,
        page: 1,
        total: res.total
      }));
    } catch (err) {
      console.error(err);
      message.error('录播加载失败！');
    }

    setLoading(false);
  }

  const columns: ColumnsType<InVideoItem> = [
    { title: '标题', dataIndex: 'title' },
    {
      title: '操作',
      key: 'handle',
      width: 70,
      render: (value: undefined, record: InVideoItem, index: number): ReactElement => {
        return (
          <Button>开始下载</Button>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <Select className={ style.typeSelect } value={ inVideoQuery?.liveType } onSelect={ handleLiveTypeSelect }>
          <Select.Option value="snh48">SNH48</Select.Option>
          <Select.Option value="bej48">BEJ48</Select.Option>
          <Select.Option value="gnz48">GNZ48</Select.Option>
          <Select.Option value="ckg48">CKG48</Select.Option>
        </Select>
        <Button disabled={ inVideoQuery === undefined } onClick={ handleGetVideoListClick }>加载录播</Button>
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ inVideoList }
        bordered={ true }
        loading={ loading }
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: false,
          pageSize: 15,
          total: inVideoQuery?.total ?? 0,
          current: inVideoQuery?.page ?? 1,
          onChange: handlePageChange
        }}
      />
    </Fragment>
  );
}

export default InVideo;