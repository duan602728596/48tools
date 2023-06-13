import { randomUUID } from 'node:crypto';
import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Form, Input, Card, Alert, Button, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { Rule } from 'rc-field-form/es/interface';
import style from './addForm.sass';
import { IDBSaveQingchunshikeUserItem } from '../../reducers/qingchunshike';
import type { QingchunshikeUserItem } from '../../types';

const idRule: Array<Rule> = [
  { required: true, message: '请填写', whitespace: true },
  { pattern: /^\d+$/, message: '必须是数字' }
];

/* 添加userId，serverId，channelId，liveId */
function AddForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();

  // 添加统计信息
  async function handleAddClick(event: MouseEvent): Promise<void> {
    let formValue: Omit<QingchunshikeUserItem, 'id'>;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      console.error(err);

      return;
    }

    dispatch(IDBSaveQingchunshikeUserItem({
      data: {
        id: randomUUID(),
        ...formValue
      }
    }));
    messageApi.success('成功添加成员信息');
    form.resetFields();
  }

  return (
    <Fragment>
      <Card title="添加一个统计信息" extra={ <Button type="primary" onClick={ handleAddClick }>添加</Button> }>
        <Alert className="mb-[16px]" type="warning" message="请确保serverId、channel和liveRoomId正确。" />
        <Form form={ form }>
          <Form.Item className={ style.formItem } label="userId" name="userId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="serverId" name="serverId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="channelId" name="channelId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="liveRoomId" name="liveRoomId" rules={ idRule }>
            <Input />
          </Form.Item>
          <Form.Item className={ style.formItem } label="description" name="description" rules={ [idRule[0]] }>
            <Input />
          </Form.Item>
        </Form>
      </Card>
      { messageContextHolder }
    </Fragment>
  );
}

export default AddForm;