import type { OpenDialogReturnValue } from 'electron';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Modal, Form, Alert, Input, message, type FormInstance, type ModalProps, type ButtonProps } from 'antd';
import type { Store } from 'antd/es/form/interface';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { ChromeFilled as IconChromeFilled } from '@ant-design/icons';
import { showOpenDialog } from '../../../utils/remote/dialog';

interface ExecutablePathProps {
  modalProps?: ModalProps;
  buttonProps?: ButtonProps;
}

/* 配置无头浏览器地址 */
function ExecutablePath(props: ExecutablePathProps): ReactElement {
  const { modalProps = {}, buttonProps = {} }: ExecutablePathProps = props;
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();

  // 取消
  function handleCloseExecutablePathModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 打开配置弹出层
  function handleOpenExecutablePathClick(event: MouseEvent): void {
    form.setFieldsValue({
      executablePath: localStorage.getItem('PUPPETEER_EXECUTABLE_PATH')
    });
    setVisible(true);
  }

  // 确认
  async function handleSetExecutablePathClick(event: MouseEvent): Promise<void> {
    let formValue: Store;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    if (formValue.executablePath && !/^\s*$/.test(formValue.executablePath)) {
      localStorage.setItem('PUPPETEER_EXECUTABLE_PATH', formValue.executablePath);
    } else {
      localStorage.removeItem('PUPPETEER_EXECUTABLE_PATH');
    }

    messageApi.success('配置成功！');
    handleCloseExecutablePathModalClick(event);
  }

  // 清除配置和完全关闭
  function handleResetExecutablePathClick(): void {
    form.resetFields();
  }

  // 选择浏览器文件的位置
  async function handleSelectExecutablePathClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openFile'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      executablePath: result.filePaths[0]
    });
  }

  return (
    <Fragment>
      <Button id="executable-path"
        icon={ <IconChromeFilled /> }
        onClick={ handleOpenExecutablePathClick }
        { ...buttonProps }
      >
        无头浏览器配置
      </Button>
      <Modal title="无头浏览器配置"
        open={ visible }
        width={ 600 }
        centered={ true }
        maskClosable={ false }
        afterClose={ handleResetExecutablePathClick }
        onOk={ handleSetExecutablePathClick }
        onCancel={ handleCloseExecutablePathModalClick }
        { ...modalProps }
      >
        <Form className="h-[255px]" form={ form }>
          <Form.Item name="executablePath" label="浏览器可执行文件">
            <Input />
          </Form.Item>
          <div className="mb-[16px] text-right">
            <Button className="ml-[6px]" type="primary" danger={ true } onClick={ handleResetExecutablePathClick }>
              清除配置
            </Button>
            <Button className="ml-[6px]" onClick={ handleSelectExecutablePathClick }>选择文件</Button>
          </div>
          <Alert type="info" message={
            <Fragment>
              <p>
                配置无头浏览器的可执行文件，需要选择
                <i className="mx-[3px]">Chrome浏览器</i>或者
                <i className="mx-[3px]">Edge浏览器</i>的
                <b>可执行文件</b>的文件地址。
              </p>
              <p>
                例如：Windows系统选择
                <i className="mx-[3px]">"Chrome.exe"</i>文件，MacOS系统需要选择
                <i className="mx-[3px]">"Google Chrome.app/Contents/MacOS/Google Chrome"</i>文件。
              </p>
            </Fragment>
          } />
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default ExecutablePath;