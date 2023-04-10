import type { ReactElement } from 'react';
import { Form, Input, type FormInstance } from 'antd';
import type { Rule } from 'rc-field-form/es/interface';
import style from './tokenForm.sass';

const rules: Array<Rule> = [
  { required: true, message: '请输入Token', whitespace: false },
  {
    async validator(rule: Rule, value: string): Promise<void> {
      if (value && !/^\s*$/.test(value)) {
        if (/^[^\r\n\b]+$/.test(value)) {
          return await Promise.resolve();
        } else {
          throw new Error('Token包含换行，请删除');
        }
      } else {
        return await Promise.resolve();
      }
    }
  }
];

/* 直接输入Token */
function TokenForm(props: { form: FormInstance }): ReactElement {
  const form: FormInstance = props.form;

  return (
    <Form form={ form }>
      <Form.Item name="token" rules={ rules }>
        <Input.TextArea className={ style.textarea } rows={ 5 } placeholder="将Token粘贴到这里" />
      </Form.Item>
    </Form>
  );
}

export default TokenForm;