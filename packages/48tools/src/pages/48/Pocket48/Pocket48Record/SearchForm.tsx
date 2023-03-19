import type { ReactElement, KeyboardEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Form, Input, type FormInstance } from 'antd';
import type { Store as FormStore } from 'antd/es/form/interface';

interface OnSubmitFunc {
  (formValue: FormStore): void | Promise<void>;
}

/**
 * 搜索
 * @param { OnSubmitFunc } props.onSubmit: 提交
 */
function SearchForm(props: { onSubmit: OnSubmitFunc }): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  // 提交
  async function handleInputPressEnter(event: KeyboardEvent<HTMLInputElement>): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    props.onSubmit(formValue);
  }

  return (
    <Form form={ form } component={ false }>
      <div className="inline-block mr-[16px] w-[130px] align-[4px]">
        <Form.Item name="q" noStyle={ true }>
          <Input className="align-[1px]"
            allowClear={ true }
            placeholder="输入姓名过滤"
            onPressEnter={ handleInputPressEnter }
          />
        </Form.Item>
      </div>
    </Form>
  );
}

SearchForm.propTypes = {
  onSubmit: PropTypes.func
};

export default SearchForm;