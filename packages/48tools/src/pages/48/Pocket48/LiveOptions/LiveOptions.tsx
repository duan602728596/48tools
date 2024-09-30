import type { OpenDialogReturnValue } from 'electron';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Form, Input, InputNumber, Button, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import classNames from 'classnames';
import commonStyle from '../../../../common.sass';
import { showOpenDialog } from '../../../../utils/remote/dialog';
import ButtonLink from '../../../../components/ButtonLink/ButtonLink';
import { IDBGetPocket48LiveOptions, IDBSavePocket48LiveOptions } from '../../reducers/pocket48';
import type { Pocket48LiveAutoGrabOptions } from '../../types';

export const OPTIONS_NAME: string = 'pocket48LiveAutoGrabOptions';

/* 自动抓取配置 */
function LiveOptions(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();

  // 获取数据
  function getData(): void {
    dispatch(IDBGetPocket48LiveOptions({
      query: OPTIONS_NAME
    })).then((res: { query: string; result?: { name: string; value: Pocket48LiveAutoGrabOptions } }): void => {
      if (res.result) {
        form.setFieldsValue(res.result.value);
      }
    });
  }

  // 保存配置
  async function handleSaveSubmit(value: Pocket48LiveAutoGrabOptions): Promise<void> {
    await dispatch(IDBSavePocket48LiveOptions({
      data: { name: OPTIONS_NAME, value }
    }));
    messageApi.success('保存成功！');
  }

  // 选择目录
  async function handleChangeDirClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      dir: result.filePaths[0]
    });
  }

  useEffect(function(): void {
    getData();
  }, []);

  return (
    <Fragment>
      <Form className="w-[600px]"
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
          <p className={ classNames('mt-[8px]', commonStyle.tips) }>
            使用"<b className="mx-[6px] my-0">,</b>"分隔姓名或ID
          </p>
        </Form.Item>
        <Form.Item label="自动保存的目录" required={ true }>
          <div className="inline-block mr-[6px] w-[380px]">
            <Form.Item name="dir" rules={ [{ required: true, message: '请选择自动保存的目录', whitespace: true }] } noStyle={ true }>
              <Input />
            </Form.Item>
          </div>
          <Button onClick={ handleChangeDirClick }>选择目录</Button>
        </Form.Item>
        <Button.Group>
          <ButtonLink linkProps={{ to: '/48/Pocket48Live' }} buttonProps={{ type: 'primary', danger: true }}>返回</ButtonLink>
          <Button type="primary" htmlType="submit">保存</Button>
        </Button.Group>
      </Form>
      { messageContextHolder }
    </Fragment>
  );
}

export default LiveOptions;