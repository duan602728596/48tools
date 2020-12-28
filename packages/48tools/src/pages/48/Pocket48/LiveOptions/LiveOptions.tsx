import { remote, OpenDialogReturnValue } from 'electron';
import { useMemo, ReactElement, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, InputNumber, Button } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './liveOptions.sass';

/* 自动抓取配置 */
function LiveOptions(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  // 选择目录
  async function handleChangeDirClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      dir: result.filePaths[0]
    });
  }

  return (
    <Form className={ style.form } form={ form } initialValues={{ time: 1 }} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
      <Form.Item name="time" label="间隔时间（分）" rules={ [{ type: 'number', min: 1, message: '间隔时间必须大于1分钟' }] }>
        <InputNumber />
      </Form.Item>
      <Form.Item label="成员姓名或ID">
        <Form.Item name="users" rules={ [{ required: true, message: '请填写成员姓名或ID', whitespace: true }] } noStyle={ true }>
          <Input.TextArea rows={ 7 } />
        </Form.Item>
        <p className={ style.tips }>
          使用"<b className={ style.b }>,</b>"分隔姓名或ID
        </p>
      </Form.Item>
      <Form.Item label="自动保存的目录">
        <Form.Item name="dir" rules={ [{ required: true, message: '请选择自动保存的目录', whitespace: true }] } noStyle={ true }>
          <Input className={ style.dirInput } />
        </Form.Item>
        <Button onClick={ handleChangeDirClick }>选择目录</Button>
      </Form.Item>
      <Button.Group>
        <Link to="/48/Pocket48Live">
          <Button type="primary" danger={ true }>返回</Button>
        </Link>
        <Button type="primary">保存</Button>
      </Button.Group>
    </Form>
  );
}

export default LiveOptions;