import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { Button, Modal, Form, Select, Input, Alert, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store as FormStore } from 'antd/es/form/interface';
import style from './addForm.sass';
import { parseAcFunUrl } from './parseAcFunUrl';
import type { Representation } from '../types';

/* 添加A站视频下载队列 */
function AddForm(props: {}): ReactElement {
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
      const representation: Array<Representation> | undefined = await parseAcFunUrl(formValue.type, formValue.id);

      if (representation) {
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
    form.resetFields(['id', 'type']);
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
      <Button type="primary" onClick={ handleOpenAddModalClick }>添加下载队列</Button>
      <Modal visible={ visible }
        title="添加下载任务"
        width={ 480 }
        centered={ true }
        maskClosable={ false }
        confirmLoading={ loading }
        afterClose={ handleAddModalClose }
        onOk={ handleAddDownloadQueueClick }
        onCancel={ handleCloseAddModalClick }
      >
        <Form className={ style.formContent }
          form={ form }
          initialValues={{ type: 'ac' }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item name="type" label="下载类型">
            <Select>
              <Select.Option value="ac">视频（ac）</Select.Option>
              <Select.Option value="aa">番剧（aa）</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="id" label="ID" rules={ [{ required: true, message: '必须输入视频ID', whitespace: true }] }>
            <Input />
          </Form.Item>
          <Alert type="info" message="ID为ac后面的字符，包括页码等。" />
        </Form>
      </Modal>
    </Fragment>
  );
}

export default AddForm;