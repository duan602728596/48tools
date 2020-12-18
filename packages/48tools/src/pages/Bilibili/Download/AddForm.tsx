import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store as FormStore } from 'antd/es/form/interface';
import style from './addForm.sass';
import { rStr } from '../../../utils/utils';
import { parseVideoUrl, parseAudioUrl } from './parseBilibiliUrl';
import { setDownloadList, BilibiliInitialState } from '../reducers/reducers';
import type { DownloadItem } from '../types';

/* state */
type RSelector = Pick<BilibiliInitialState, 'downloadList'>;

const state: Selector<any, RSelector> = createStructuredSelector({
  downloadList: createSelector(
    ({ bilibili }: { bilibili: BilibiliInitialState }): Array<DownloadItem> => bilibili.downloadList,
    (data: Array<DownloadItem>): Array<DownloadItem> => data
  )
});

/* 添加下载信息 */
function AddForm(props: {}): ReactElement {
  const { downloadList }: RSelector = useSelector(state);
  const dispatch: Dispatch = useDispatch();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [form]: [FormInstance] = Form.useForm();

  // 确定添加视频
  async function handleAddDownloadQueueClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    setLoading(true);

    try {
      const result: string | void = formValue.type === 'au'
        ? await parseAudioUrl(formValue.id)
        : await parseVideoUrl(formValue.type, formValue.id, formValue.page);

      if (result) {
        dispatch(setDownloadList(
          downloadList.concat([{
            qid: rStr(30),
            durl: result,
            type: formValue.type,
            id: formValue.id,
            page: formValue.page ?? 1
          }])
        ));
        setVisible(false);
      } else {
        message.warn('没有获取到媒体地址！');
      }
    } catch (err) {
      message.error('地址解析失败！');
      console.error(err);
    }

    setLoading(false);
  }

  // 关闭窗口后重置表单
  function handleAddModalClose(): void {
    form.resetFields();
  }

  // 打开弹出层
  function handleOpenAddModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(true);
  }

  // 关闭弹出层
  function handleCloseAddModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button type="primary" onClick={ handleOpenAddModalClick }>添加下载任务</Button>
      <Modal visible={ visible }
        title="添加下载任务"
        width={ 400 }
        centered={ true }
        maskClosable={ false }
        confirmLoading={ loading }
        afterClose={ handleAddModalClose }
        onOk={ handleAddDownloadQueueClick }
        onCancel={ handleCloseAddModalClick }
      >
        <Form className={ style.formContent } form={ form } initialValues={{ type: 'bv' }} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
          <Form.Item name="id" label="ID" rules={ [{ required: true, message: '必须输入视频ID', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="下载类型">
            <Select>
              <Select.Option value="bv">视频（bv）</Select.Option>
              <Select.Option value="av">视频（av）</Select.Option>
              <Select.Option value="au">音频</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="page" label="Page">
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

export default AddForm;