import type { OpenDialogReturnValue } from 'electron';
import { useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Modal, Button, Input, Form, App, Alert, type FormInstance } from 'antd';
import type { Store } from 'antd/es/form/interface';
import type { useAppProps } from 'antd/es/app/context';
import { showOpenDialog } from '../../../utils/remote/dialog';
import { Pocket48Login } from '../enum';

export const title: string = '口袋48 App Data目录配置';

export interface UseAppDataDirReturnType {
  modal: ReactElement;
  button: ReactElement;
  handleOpenSelectAppDataDirClick(): void;
}

/* app data dir配置 */
export function useAppDataDir(): UseAppDataDirReturnType {
  const { message: messageApi }: useAppProps = App.useApp();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [form]: [FormInstance] = Form.useForm();

  // 取消
  function handleCloseSetAppDataDirModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 打开配置弹出层
  function handleOpenSelectAppDataDirClick(): void {
    form.setFieldsValue({
      appDataDir: localStorage.getItem(Pocket48Login.AppDataDir)
    });
    setVisible(true);
  }

  // 确认
  async function handleSetAppDataDirClick(event: MouseEvent): Promise<void> {
    let formValue: Store;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    if (formValue.appDataDir && !/^\s*$/.test(formValue.appDataDir)) {
      localStorage.setItem(Pocket48Login.AppDataDir, formValue.appDataDir);
    } else {
      localStorage.removeItem(Pocket48Login.AppDataDir);
    }

    messageApi.success('配置成功！');
    handleCloseSetAppDataDirModalClick(event);
  }

  // 选择浏览器文件夹的位置
  async function handleSelectAppDataDirClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      appDataDir: result.filePaths[0]
    });
  }

  return {
    button: <Button onClick={ handleOpenSelectAppDataDirClick }>{ title }</Button>,
    modal: (
      <Modal title={ title }
        open={ visible }
        width={ 600 }
        centered={ true }
        maskClosable={ false }
        afterClose={ form.resetFields }
        onOk={ handleSetAppDataDirClick }
        onCancel={ handleCloseSetAppDataDirModalClick }
      >
        <Form className="h-[255px]" form={ form }>
          <Form.Item name="appDataDir" label="口袋48 data目录">
            <Input />
          </Form.Item>
          <div className="mb-[16px] text-right">
            <Button className="ml-[6px]" onClick={ handleSelectAppDataDirClick }>选择文件夹</Button>
          </div>
          <Alert type="info" message={ <p>最新的网易云信SDK需要手动配置App Data目录后才能使用。</p> } />
        </Form>
      </Modal>
    ),
    handleOpenSelectAppDataDirClick
  };
}