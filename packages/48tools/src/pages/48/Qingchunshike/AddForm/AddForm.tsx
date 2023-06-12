import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { Form, Input, Card, Alert, Button, type FormInstance } from 'antd';
import type { Rule } from 'rc-field-form/es/interface';
import style from './addForm.sass';
import type { QingchunshikeUserItem } from '../../types';

const idRule: Array<Rule> = [
  { required: true, message: '请填写直播间ID', whitespace: true },
  { pattern: /^\d+$/, message: '直播间ID必须是数字' }
];

/* 添加userId，serverId，channelId，liveId */
function AddForm(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  // 添加统计信息
  async function handleAddClick(event: MouseEvent): Promise<void> {
    let formValue: Omit<QingchunshikeUserItem, 'id'>;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Fragment>
      <Card title="添加一个统计信息" extra={ <Button type="primary" onClick={ handleAddClick }>添加</Button> }>
        <Alert className="mb-[16px]" type="warning" message="请确保serverId、channel和liveId正确" />
        <Form form={ form }>
          <Form.Item className={ style.formItem } label="userId" id="userId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="serverId" id="serverId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="channelId" id="channelId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="liveId" id="liveId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="description" id="description" rules={ [idRule[0]] }>
            <Input />
          </Form.Item>
        </Form>
      </Card>
    </Fragment>
  );
}

export default AddForm;