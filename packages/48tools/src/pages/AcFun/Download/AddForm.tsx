import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Modal, Form, Select, Input, Alert, message, Transfer, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { Store as FormStore } from 'antd/es/form/interface';
import { pick } from '../../../utils/lodash';
import { parseAcFunUrl, type ParseAcFunUrlResult } from './function/parseAcFunUrl';
import { setAddDownloadList, setAddDownloadAllList } from '../reducers/acfunDownload';
import VideoListSelect from './VideoListSelect';
import type { Representation, VideoInfo, VideoInfoWithKey, DownloadItem } from '../types';

/* 视频分类 */
const acfunVideoTypes: Array<{ label: string; value: string }> = [
  { value: 'ac', label: '视频（ac）' },
  { value: 'aa', label: '番剧（aa）' }
];

type TypesResult = { [key: string]: string };
export const acfunVideoTypesMap: TypesResult = acfunVideoTypes.reduce(
  function(result: TypesResult, item: { label: string; value: string }, index: number): TypesResult {
    result[item.value] = item.label;

    return result;
  }, {});

/* 视频分类的select选项的渲染 */
function typeSelectOptionsRender(): Array<ReactNode> {
  return acfunVideoTypes.map((item: { label: string; value: string }, index: number): ReactElement => {
    return <Select.Option key={ item.value } value={ item.value }>{ item.label }</Select.Option>;
  });
}

/* 添加A站视频下载队列 */
function AddForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [refreshVideoListLoading, setRefreshVideoListLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [videoList, setVideoList]: [Array<VideoInfoWithKey>, D<S<Array<VideoInfoWithKey>>>] = useState([]); // 视频列表
  const [form]: [FormInstance] = Form.useForm();

  // 视频列表刷新
  async function handleRefreshVideoListClick(event: MouseEvent): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    setRefreshVideoListLoading(true);

    try {
      const { videoList: list }: ParseAcFunUrlResult = await parseAcFunUrl(formValue.type, formValue.id);

      if (list) {
        setVideoList(list.map((o: VideoInfo, i: number): VideoInfoWithKey => ({ ...o, key: o.id, pageIndex: i + 1 })));
      } else {
        messageApi.warning('没有获取到视频列表！');
      }
    } catch (err) {
      messageApi.error('视频列表获取失败！');
      console.error(err);
    }

    setRefreshVideoListLoading(false);
  }

  // 确定添加多个视频
  async function handleAddDownloadVideoListClick(event: MouseEvent): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    if (!(formValue?.videoList?.length)) {
      messageApi.warning('没有选择视频。');

      return;
    }

    const [basicId]: [string] = formValue.id.split('_');

    dispatch(setAddDownloadAllList(
      formValue.videoList.map((o: VideoInfoWithKey): DownloadItem => {
        return {
          qid: randomUUID(),
          type: formValue.type,
          id: `${ basicId }_${ o.pageIndex }`,
          representation: undefined
        };
      })
    ));
    setVisible(false);
  }

  // 确定添加视频
  async function handleAddDownloadQueueClick(event: MouseEvent): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    setLoading(true);

    try {
      const { representation }: ParseAcFunUrlResult = await parseAcFunUrl(formValue.type, formValue.id);

      if (representation) {
        dispatch(setAddDownloadList({
          qid: randomUUID(),
          type: formValue.type,
          id: formValue.id,
          representation: representation.map((o: Representation): Representation => pick(o, ['m3u8Slice', 'url', 'qualityLabel']))
        }));
        setVisible(false);
      } else {
        messageApi.warning('没有获取到媒体地址！');
      }
    } catch (err) {
      messageApi.error('地址解析失败！');
      console.error(err);
    }

    setLoading(false);
  }

  // 关闭窗口后重置表单
  function handleAddModalClose(): void {
    form.resetFields(['id', 'type']);
  }

  // 打开弹出层
  function handleOpenAddModalClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭弹出层
  function handleCloseAddModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button type="primary" data-test-id="acfun-download-add-btn" onClick={ handleOpenAddModalClick }>添加下载队列</Button>
      <Modal open={ visible }
        title="添加下载任务"
        width={ 880 }
        centered={ true }
        maskClosable={ false }
        confirmLoading={ loading }
        afterClose={ handleAddModalClose }
        footer={
          <Fragment>
            <Button onClick={ handleCloseAddModalClick }>取消</Button>
            <Button onClick={ handleAddDownloadVideoListClick }>确定选择视频列表</Button>
            <Button type="primary" onClick={ handleAddDownloadQueueClick }>确定</Button>
          </Fragment>
        }
        onCancel={ handleCloseAddModalClick }
      >
        <Form className="h-[455px]"
          form={ form }
          initialValues={{ type: 'ac' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item name="type" label="下载类型" data-test-id="acfun-download-form-type">
            <Select>{ typeSelectOptionsRender() }</Select>
          </Form.Item>
          <Form.Item name="id" label="ID" rules={ [{ required: true, message: '必须输入视频ID', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item label="批量选择">
            <Button className="mb-[8px]" loading={ refreshVideoListLoading } onClick={ handleRefreshVideoListClick }>视频列表刷新</Button>
            <Form.Item name="videoList" noStyle={ true }>
              <VideoListSelect dataSource={ videoList } />
            </Form.Item>
          </Form.Item>
          <Alert type="info" message="ID为ac后面的字符，包括页码等。" />
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default AddForm;