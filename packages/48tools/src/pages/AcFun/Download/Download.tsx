import { Fragment, ReactElement, ReactNodeArray, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Table, Input, Select, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import style from './download.sass';
import Header from '../../../components/Header/Header';
import AddForm from './AddForm';
import { setDeleteDownloadList, AcFunDownloadInitialState } from '../reducers/download';
import type { DownloadItem, Representation } from '../types';

/* state */
type RSelector = Pick<AcFunDownloadInitialState, 'downloadList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  // 下载任务列表
  downloadList: createSelector(
    ({ acfunDownload }: { acfunDownload: AcFunDownloadInitialState }): Array<DownloadItem> => {
      return acfunDownload.downloadList;
    },
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  )
});

/* A站视频下载 */
function Download(props: {}): ReactElement {
  const { downloadList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 删除一个下载队列
  function handleDeleteDownloadItemClick(record: DownloadItem, event: MouseEvent<HTMLButtonElement>): void {
    dispatch(setDeleteDownloadList(record));
  }

  // 渲染下载
  function handleDownloadQualitySelectOptionRender(representation: Array<Representation>): ReactNodeArray {
    return representation.map((item: Representation, index: number): ReactElement => {
      return <Select.Option key={ item.url } value={ item.url }>{ item.qualityLabel }</Select.Option>;
    });
  }

  const columns: ColumnsType<DownloadItem> = [
    { title: 'ID', dataIndex: 'id' },
    { title: '下载类型', dataIndex: 'type' },
    {
      title: '操作',
      key: 'handle',
      width: 245,
      render: (value: undefined, record: DownloadItem, index: number): ReactElement => {
        return (
          <Input.Group compact={ true }>
            <Select className={ style.downloadSelect } placeholder="下载">
              { handleDownloadQualitySelectOptionRender(record.representation) }
            </Select>
            <Button type="primary"
              danger={ true }
              onClick={ (event: MouseEvent<HTMLButtonElement>): void => handleDeleteDownloadItemClick(record, event) }
            >
              删除
            </Button>
          </Input.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Header>
        <AddForm />
      </Header>
      <Table size="middle"
        columns={ columns }
        dataSource={ downloadList }
        bordered={ true }
        rowKey="qid"
        pagination={{
          showQuickJumper: true
        }}
      />
    </Fragment>
  );
}

export default Download;