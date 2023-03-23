import { Fragment, useState, useEffect, type ReactElement, type Dispatch as D, SetStateAction as S, type MouseEvent } from 'react';
import { Button, Form, Input, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import style from './loginForm.sass';
import { requestSMS } from '../services/pocket48Login';
import SMS from '../function/SMS';
import type { SMSResult } from '../services/interface';

const sms: SMS = new SMS();

/* 验证码登录 */
function LoginForm(props: { form: FormInstance }): ReactElement {
  const form: FormInstance = props.form;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [second, setSecond]: [number, D<S<number>>] = useState(sms.time);

  // 发送验证码
  async function handleSendSMSCodeClick(event: MouseEvent): Promise<void> {
    let value: { area: string; mobile: string };

    try {
      value = await form.validateFields(['area', 'mobile']);
    } catch {
      return;
    }

    sms.start();

    try {
      const res: SMSResult = await requestSMS(value.mobile, value.area);

      if (!res.success) {
        messageApi.error('验证码发送失败！');

        return;
      }
    } catch (err) {
      console.error(err);
      messageApi.error('验证码发送失败！');
    }
  }

  // 更新验证码
  function handleSMSUpdate(event: Event): void {
    setSecond(event['data']);
  }

  useEffect(function(): () => void {
    document.addEventListener(sms.event.type, handleSMSUpdate);

    return function(): void {
      document.removeEventListener(sms.event.type, handleSMSUpdate);
    };
  }, []);

  return (
    <Fragment>
      <Form form={ form } initialValues={{ area: '86' }} labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
        <Form.Item className={ style.formItem } label="手机" required={ true }>
          <div className="flex">
            <div className="w-[90px]">
              <Form.Item name="area" rules={ [{ required: true, message: '请输入地区', whitespace: false }] } noStyle={ true }>
                <Input prefix="+" />
              </Form.Item>
            </div>
            <div className="flex-grow ml-[8px]">
              <Form.Item name="mobile" rules={ [{ required: true, message: '请输入手机号', whitespace: false }] } noStyle={ true }>
                <Input />
              </Form.Item>
            </div>
          </div>
        </Form.Item>
        <Form.Item className={ style.formItem } label="验证码" required={ true }>
          <div className="flex">
            <div className="flex-grow mr-[8px]">
              <Form.Item name="code" rules={ [{ required: true, message: '请输入验证码', whitespace: false }] } noStyle={ true }>
                <Input />
              </Form.Item>
            </div>
            <Button className="w-[120px]" disabled={ second !== 0 } onClick={ handleSendSMSCodeClick }>
              { second === 0 ? '发送验证码' : `${ second }秒` }
            </Button>
          </div>
        </Form.Item>
      </Form>
      { messageContextHolder }
    </Fragment>
  );
}

export default LoginForm;