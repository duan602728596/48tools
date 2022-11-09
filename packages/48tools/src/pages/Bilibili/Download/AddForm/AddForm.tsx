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
import { Button, Modal, Form, Input, Select, InputNumber, Checkbox, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store as FormStore } from 'antd/es/form/interface';
import { parseVideoUrlV2, parseAudioUrl, parseBangumiVideo } from '../parseBilibiliUrl';
import { setAddDownloadList } from '../../reducers/download';

/* 视频分类 */
const bilibiliVideoTypes: Array<{ label: string; value: string }> = [
  { value: 'bv', label: '视频（BV）' },
  { value: 'av', label: '视频（av）' },
  { value: 'au', label: '音频（au）' },
  { value: 'ep', label: '番剧（ep）' },
  { value: 'ss', label: '番剧（ss）' }
];

type TypesResult = { [key: string]: string };
export const bilibiliVideoTypesMap: TypesResult = bilibiliVideoTypes.reduce(
  function(result: TypesResult, item: { label: string; value: string }, index: number): TypesResult {
    result[item.value] = item.label;

    return result;
  }, {});

/* 视频分类的select选项的渲染 */
function typeSelectOptionsRender(): Array<ReactNode> {
  return bilibiliVideoTypes.map((item: { label: string; value: string }, index: number): ReactElement => {
    return <Select.Option key={ item.value } value={ item.value }>{ item.label }</Select.Option>;
  });
}

/* 添加下载信息 */
function AddForm(props: {}): ReactElement {
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
      let result: string | { flvUrl: string; pic: string } | void;

      if (formValue.type === 'au') {
        // 下载音频
        result = await parseAudioUrl(formValue.id, !!formValue.proxy);
      } else if (formValue.type === 'ss' || formValue.type === 'ep') {
        // 下载番剧
        result = await parseBangumiVideo(formValue.type, formValue.id, !!formValue.proxy);
      } else {
        // 下载av、bv视频，会返回视频封面
        result = await parseVideoUrlV2(formValue.type, formValue.id, formValue.page, !!formValue.proxy);
      }

      if (result) {
        dispatch(setAddDownloadList({
          qid: randomUUID(),
          durl: typeof result === 'object' ? result.flvUrl : result,
          pic: typeof result === 'object' ? result.pic : undefined,
          type: formValue.type,
          id: formValue.id,
          page: formValue.page ?? 1
        }));
        setVisible(false);
      } else {
        message.warning('没有获取到媒体地址！');
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
      <Button type="primary" data-test-id="bilibili-download-add-btn" onClick={ handleOpenAddModalClick }>添加下载任务</Button>
      <Modal open={ visible }
        title="添加下载任务"
        width={ 480 }
        centered={ true }
        maskClosable={ false }
        confirmLoading={ loading }
        afterClose={ handleAddModalClose }
        onOk={ handleAddDownloadQueueClick }
        onCancel={ handleCloseAddModalClick }
      >
        <Form className="h-[210px]"
          form={ form }
          initialValues={{ type: 'bv' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item name="type" label="下载类型" data-test-id="bilibili-download-form-type">
            <Select>{ typeSelectOptionsRender() }</Select>
          </Form.Item>
          <Form.Item name="id" label="ID" rules={ [{ required: true, message: '必须输入视频ID', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Form.Item name="page" label="Page">
            <InputNumber />
          </Form.Item>
          <Form.Item name="proxy" label="Proxy" valuePropName="checked">
            <Checkbox>用于港澳台番剧地址的获取</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

export default AddForm;