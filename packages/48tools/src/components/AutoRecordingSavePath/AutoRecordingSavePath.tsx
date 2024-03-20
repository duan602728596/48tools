import type { OpenDialogReturnValue } from 'electron';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Modal, Form, Input, Space, App, type FormInstance } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import { showOpenDialog } from '../../utils/remote/dialog';

interface FormValue {
  autoRecordSavePath: string | undefined | null;
}

interface AutoRecordingSavePathProps {
  localStorageItemKey: string;
}

/* 配置自动保存的路径 */
function AutoRecordingSavePath(props: AutoRecordingSavePathProps): ReactElement {
  const { localStorageItemKey }: AutoRecordingSavePathProps = props;
  const [open, setOpen]: [boolean, D<S<boolean>>] = useState(false); // 弹出层
  const { message: messageApi }: useAppProps = App.useApp();
  const [form]: [FormInstance<FormValue>] = Form.useForm();

  // 取消
  function handleCloseAutoRecordSavePathModalClick(event: MouseEvent): void {
    setOpen(false);
  }

  // 打开配置弹出层
  function handleOpenAutoRecordSavePathClick(event: MouseEvent): void {
    form.setFieldsValue({
      autoRecordSavePath: localStorage.getItem(localStorageItemKey)
    });
    setOpen(true);
  }

  // 确认
  async function handleAutoRecordSavePathClick(event: MouseEvent): Promise<void> {
    let formValue: FormValue;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    if (formValue.autoRecordSavePath && !/^\s*$/.test(formValue.autoRecordSavePath)) {
      localStorage.setItem(localStorageItemKey, formValue.autoRecordSavePath);
    } else {
      localStorage.removeItem(localStorageItemKey);
    }

    messageApi.success('配置成功！');
    handleCloseAutoRecordSavePathModalClick(event);
  }

  // 选择浏览器文件的位置
  async function handleSelectExecutablePathClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      autoRecordSavePath: result.filePaths[0]
    });
  }

  return (
    <Fragment>
      <Button onClick={ handleOpenAutoRecordSavePathClick }>自动录制直播保存目录设置</Button>
      <Modal title="自动录制直播保存目录设置"
        open={ open }
        width={ 600 }
        centered={ true }
        afterClose={ form.resetFields }
        onOk={ handleAutoRecordSavePathClick }
        onCancel={ handleCloseAutoRecordSavePathModalClick }
      >
        <Form form={ form }>
          <Form.Item label="视频储存目录">
            <Space>
              <Form.Item name="autoRecordSavePath" noStyle={ true }>
                <Input className="w-[300px]" />
              </Form.Item>
              <Button className="ml-[6px]" onClick={ handleSelectExecutablePathClick }>选择文件夹</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  );
}

export default AutoRecordingSavePath;