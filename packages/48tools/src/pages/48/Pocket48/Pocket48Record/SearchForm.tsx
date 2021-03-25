import type { ReactElement, KeyboardEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store } from 'antd/es/form/interface';
import style from './searchForm.sass';

interface OnSubmitFunc {
  (formValue: Store): void | Promise<void>;
}

/**
 * 搜索
 * @param { OnSubmitFunc } props.onSubmit: 提交
 */
function SearchForm(props: { onSubmit: OnSubmitFunc }): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  // 提交
  async function handleInputPressEnter(event: KeyboardEvent<HTMLInputElement>): Promise<void> {
    let formValue: Store;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    props.onSubmit(formValue);
  }

  return (
    <Form form={ form } component={ false }>
      <div className={ style.searchInput }>
        <Form.Item name="q" noStyle={ true }>
          <Input allowClear={ true }
            placeholder="输入小偶像名称搜索"
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