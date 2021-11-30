import type { OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import { useEffect, type ReactElement, type MouseEvent } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Input, InputNumber, Button, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './liveOptions.sass';
import { idbGetPocket48LiveOptions, idbSavePocket48LiveOptions } from '../../reducers/pocket48';
import type { Pocket48LiveAutoGrabOptions } from '../../types';

export const OPTIONS_NAME: string = 'pocket48LiveAutoGrabOptions';

/* 自动抓取配置 */
function LiveOptions(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();

  // 获取数据
  function getData(): void {
    dispatch(idbGetPocket48LiveOptions({
      query: OPTIONS_NAME
    })).then((res: { query: string; result?: { name: string; value: Pocket48LiveAutoGrabOptions } }): void => {
      if (res.result) {
        form.setFieldsValue(res.result.value);
      }
    });
  }

  // 保存配置
  async function handleSaveSubmit(value: Pocket48LiveAutoGrabOptions): Promise<void> {
    await dispatch(idbSavePocket48LiveOptions({
      data: { name: OPTIONS_NAME, value }
    }));
    message.success('保存成功！');
  }

  // 选择目录
  async function handleChangeDirClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      dir: result.filePaths[0]
    });
  }

  useEffect(function(): void {
    getData();
  }, []);

  return (
    <Form className={ style.form }
      form={ form }
      initialValues={{ time: 1 }}
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 19 }}
      onFinish={ handleSaveSubmit }
    >
      <Form.Item name="time"
        label="间隔时间（分）"
        rules={ [
          { required: true, message: '请填写间隔时间' },
          { type: 'number', min: 1, message: '间隔时间必须大于1分钟' }
        ] }
      >
        <InputNumber />
      </Form.Item>
      <Form.Item label="成员姓名或ID" required={ true }>
        <Form.Item name="users" rules={ [{ required: true, message: '请填写成员姓名或ID', whitespace: true }] } noStyle={ true }>
          <Input.TextArea rows={ 7 } />
        </Form.Item>
        <p className={ style.tips }>
          使用"<b className={ style.b }>,</b>"分隔姓名或ID
        </p>
      </Form.Item>
      <Form.Item label="自动保存的目录" required={ true }>
        <div className={ style.dirInput }>
          <Form.Item name="dir" rules={ [{ required: true, message: '请选择自动保存的目录', whitespace: true }] } noStyle={ true }>
            <Input />
          </Form.Item>
        </div>
        <Button onClick={ handleChangeDirClick }>选择目录</Button>
      </Form.Item>
      <Button.Group>
        <Link to="/48/Pocket48Live">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
        <Button type="primary" htmlType="submit">保存</Button>
      </Button.Group>
    </Form>
  );
}

export default LiveOptions;