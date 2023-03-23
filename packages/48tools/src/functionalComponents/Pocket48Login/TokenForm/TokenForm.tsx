import type { ReactElement } from 'react';
import { Form, Input, type FormInstance } from 'antd';
import style from './tokenForm.sass';

/* 直接输入Token */
function TokenForm(props: { form: FormInstance }): ReactElement {
  const form: FormInstance = props.form;

  return (
    <Form form={ form }>
      <Form.Item name="token" rules={ [{ required: true, message: '请输入Token', whitespace: false }] }>
        <Input.TextArea className={ style.textarea } rows={ 5 } placeholder="将Token粘贴到这里" />
      </Form.Item>
    </Form>
  );
}

export default TokenForm;