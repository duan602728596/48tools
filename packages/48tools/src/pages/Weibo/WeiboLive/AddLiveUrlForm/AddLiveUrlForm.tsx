import type { ReactElement } from 'react';
import { Form, Input, Button, type FormInstance } from 'antd';

/* 解析、添加直播地址 */
function AddLiveUrlForm(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  return (
    <Form form={ form }>
      <Form.Item name="liveValue" noStyle={ true }>
        <Input className="mr-[8px]" />
      </Form.Item>
      <Button>开始录制</Button>
    </Form>
  );
}

export default AddLiveUrlForm;