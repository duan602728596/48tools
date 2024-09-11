import { useState, useSyncExternalStore, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Form, Input, Select, App, type FormInstance } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import type { DefaultOptionType } from 'rc-select/es/Select';
import classNames from 'classnames';
import {
  requestSMS,
  type SMSResult,
  type ForeignVerificationMessage,
  type ForeignVerificationAnswerItem
} from '@48tools-api/48/login';
import commonStyle from '../../../common.sass';
import style from './loginForm.sass';
import { smsStore } from '../function/SMSStore';

/* 验证码登录 */
function LoginForm(props: { form: FormInstance }): ReactElement {
  const form: FormInstance = props.form;
  const { message: messageApi }: useAppProps = App.useApp();
  const smsTime: number = useSyncExternalStore(smsStore.subscribe, smsStore.getSnapshot);
  const [foreignVerificationQuestion, setForeignVerificationQuestion]: [string | null, D<S<string | null>>] = useState(null);
  const [foreignVerificationOptions, setForeignVerificationOptions]: [
    Array<DefaultOptionType> | null,
    D<S<Array<DefaultOptionType> | null>>
  ] = useState(null);

  // 发送验证码
  async function handleSendSMSCodeClick(event: MouseEvent): Promise<void> {
    let value: { area: string; mobile: string; answer?: string };

    try {
      value = await form.validateFields(['area', 'mobile', 'answer']);
    } catch {
      return;
    }

    try {
      const res: SMSResult = await requestSMS({
        mobile: value.mobile,
        area: value.area,
        answer: value.answer
      });

      if (res.status === 2001) {
        const answer: ForeignVerificationMessage = JSON.parse(res.message);

        setForeignVerificationQuestion(answer.question);
        setForeignVerificationOptions(
          answer.answer.map((o: ForeignVerificationAnswerItem): DefaultOptionType => ({
            value: o.option.toString(),
            label: o.value
          }))
        );
      } else {
        smsStore.start();
        setForeignVerificationQuestion(null);
        setForeignVerificationOptions(null);

        if (!res.success) {
          messageApi.error('验证码发送失败！');
        }
      }
    } catch (err) {
      console.error(err);
      messageApi.error('验证码发送失败！');
    }
  }

  return (
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
          <Button className="w-[120px]" disabled={ smsTime !== 0 } onClick={ handleSendSMSCodeClick }>
            { smsTime === 0 ? '发送验证码' : `${ smsTime }秒` }
          </Button>
        </div>
      </Form.Item>
      {
        foreignVerificationOptions && foreignVerificationQuestion ? (
          <Form.Item className={ style.formItem } label="问题验证" required={ true }>
            <p className="m-0 leading-[32px]">{ foreignVerificationQuestion }</p>
            <p className={ classNames('mb-[6px] leading-[32px]', commonStyle.tips) }>选择答案后请重新发送验证码！</p>
            <Form.Item name="answer" rules={ [{ required: true, message: '请选择答案', whitespace: false }] } noStyle={ true }>
              <Select options={ foreignVerificationOptions } />
            </Form.Item>
          </Form.Item>
        ) : null
      }
    </Form>
  );
}

export default LoginForm;