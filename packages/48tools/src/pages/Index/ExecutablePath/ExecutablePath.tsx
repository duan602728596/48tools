import type { OpenDialogReturnValue } from 'electron';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Modal, Form, Alert, Input, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { Store } from 'antd/es/form/interface';
import { ChromeFilled as IconChromeFilled, QuestionCircleTwoTone as IconQuestionCircleTwoTone } from '@ant-design/icons';
import * as classNames from 'classnames';
import style from './executablePath.sass';
import { showOpenDialog } from '../../../utils/remote/dialog';

/* 配置无头浏览器地址 */
function ExecutablePath(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层
  const [form]: [FormInstance] = Form.useForm();

  // 取消
  function handleCloseExecutablePathModalClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(false);
  }

  // 打开配置弹出层
  function handleOpenExecutablePathClick(event: MouseEvent<HTMLButtonElement>): void {
    form.setFieldsValue({
      executablePath: localStorage.getItem('PUPPETEER_EXECUTABLE_PATH')
    });
    setVisible(true);
  }

  // 确认
  async function handleSetExecutablePathClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
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

    message.success('配置成功！');
    handleCloseExecutablePathModalClick(event);
  }

  // 清除配置和完全关闭
  function handleResetExecutablePathClick(): void {
    form.resetFields();
  }

  // 选择浏览器文件的位置
  async function handleSelectExecutablePathClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      executablePath: result.filePaths[0]
    });
  }

  return (
    <Fragment>
      <Button icon={ <IconChromeFilled /> } onClick={ handleOpenExecutablePathClick }>无头浏览器配置</Button>
      <Modal title="无头浏览器配置"
        open={ visible }
        width={ 600 }
        centered={ true }
        afterClose={ handleResetExecutablePathClick }
        onOk={ handleSetExecutablePathClick }
        onCancel={ handleCloseExecutablePathModalClick }
      >
        <Form className="h-[445px]" form={ form }>
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
              <h4>
                <IconQuestionCircleTwoTone className={ classNames('mr-[6px] text-[22px]', style.iconQuestion) } />
                无头浏览器配置的是什么？
              </h4>
              <p>
                需要通过无头浏览器调用电脑已安装的浏览器，用来登陆微博的账号，并获取Cookie。
                配置无头浏览器的可执行文件，需要选择
                <i className={ style.iText }>Chrome浏览器</i>或者
                <i className={ style.iText }>Edge浏览器</i>的
                <b>可执行文件</b>的文件地址。
              </p>
              <p>
                例如：Windows系统选择
                <i className={ style.iText }>"Chrome.exe"</i>文件，MacOS系统需要选择
                <i className={ style.iText }>"Google Chrome.app/Contents/MacOS/Google Chrome"</i>文件。
              </p>
              <h4>
                <IconQuestionCircleTwoTone className={ classNames('mr-[6px] text-[22px]', style.iconQuestion) } />
                为什么要配置无头浏览器的可执行文件地址？
              </h4>
              <p>
                微博PC的登陆，Cookie的有效时间只有一天。 所以使用无头浏览器启动微博的移动端登陆页，先在移动端登陆一遍，
                然后跳转到微博的PC首页获取Cookie，这样获取到的Cookie有效时间就会很长。
              </p>
            </Fragment>
          } />
        </Form>
      </Modal>
    </Fragment>
  );
}

export default ExecutablePath;