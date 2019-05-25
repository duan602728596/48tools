import React, { Fragment, useState } from 'react';
import { Switch, Modal, Form, Input, Radio } from 'antd';
import { getProxy, setProxy } from './index';
import style from './style.sass';

function Proxy(props) {
  const labelProps = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 }
  };
  const proxy = getProxy();
  const [checked, setChecked] = useState(!!proxy && proxy.open);
  const [modalVisible, setModalVisible] = useState(false);
  const { getFieldDecorator, validateFields } = props.form;

  // change事件
  function handleSwitchChange(checked, event) {
    if (checked) {
      setModalVisible(true);
    } else {
      const proxy = getProxy();

      setChecked(false);
      setProxy({
        ...proxy,
        open: false
      });
    }
  }

  // 取消
  function handleModalCancel(event) {
    setModalVisible(false);
  }

  // 确认
  function handleModalOk(event) {
    validateFields((err, value) => {
      if (err) return;

      setProxy({
        ...value,
        open: true
      });
      setChecked(true);
      setModalVisible(false);
    });
  }

  return (
    <Fragment>
      <div>
        <Switch checked={ checked } onChange={ handleSwitchChange } />
        <label className={ style.updateLabel }>对口袋48接口启动代理</label>
      </div>
      <Modal title="代理配置"
        visible={ modalVisible }
        onOk={ handleModalOk }
        onCancel={ handleModalCancel }
      >
        <Form.Item label="protocol" { ...labelProps }>
          {
            getFieldDecorator('protocol', {
              initialValue: proxy ? proxy.protocol : undefined
            })(<Radio.Group options={ ['http', 'https'] } />)
          }
        </Form.Item>
        <Form.Item label="host" { ...labelProps }>
          {
            getFieldDecorator('host', {
              initialValue: proxy ? proxy.host : undefined,
              rules: [
                {
                  required: true,
                  message: '必须填写host！'
                }
              ]
            })(<Input />)
          }
        </Form.Item>
        <Form.Item label="port" { ...labelProps }>
          {
            getFieldDecorator('port', {
              initialValue: proxy ? proxy.port : undefined,
              rules: [
                {
                  required: true,
                  message: '必须填写port！'
                }
              ]
            })(<Input />)
          }
        </Form.Item>
      </Modal>
    </Fragment>
  );
}

export default Form.create()(Proxy);