import { useState, ReactElement } from 'react';
import { Form, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './getLiveUrl.sass';

/* 抓取直播信息表单 */
function GetLiveUrl(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();

  return (
    <Form form={ form } component={ false }>
      <Form.Item name="type" noStyle={ true }>
        <Select className={ style.typeSelect } placeholder="选择团体">
          <Select.Option value="snh48">SNH48</Select.Option>
          <Select.Option value="bej48">BEJ48</Select.Option>
          <Select.Option value="gnz48">GNZ48</Select.Option>
          <Select.Option value="ckg48">CKG48</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="live" noStyle={ true }>
        <Select className={ style.liveSelect } placeholder="选择公演"></Select>
      </Form.Item>
    </Form>
  );
}

export default GetLiveUrl;