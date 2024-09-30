import { shell, type OpenDialogReturnValue } from 'electron';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Modal, Form, Input, message, Alert, type FormInstance } from 'antd';
import type { Store } from 'antd/es/form/interface';
import type { UseMessageReturnType } from '@48tools-types/antd';
import Icon, { DownloadOutlined as IconDownloadOutlined, SwapLeftOutlined as IconSwapLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import style from './FFmpegOption.sass';
import { showOpenDialog } from '../../../utils/remote/dialog';
import { ffmpegInstallHtmlPage } from '../../../utils/utils';
import HelpButtonGroup from '../../../components/HelpButtonGroup/HelpButtonGroup';
import IconFFmpegSvgComponent from '../images/ffmpeg.component.svg';

const IconFFmpeg: ReactElement = <Icon className={ style.ffmpegIcon } component={ IconFFmpegSvgComponent } />;

/* 配置ffmpeg地址 */
function FFmpegOption(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false); // 弹出层
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();

  // 下载ffmpeg
  function handleOpenIssuesClick(event: MouseEvent): void {
    shell.openExternal(ffmpegInstallHtmlPage);
  }

  // 打开配置弹出层
  function handleOpenFFmpegOptionClick(event: MouseEvent): void {
    form.setFieldsValue({
      ffmpeg: localStorage.getItem('FFMPEG_PATH')
    });
    setVisible(true);
  }

  // 取消
  function handleCloseFFmpegOptionModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 确认
  async function handleSetFFmpegClick(event: MouseEvent): Promise<void> {
    let formValue: Store;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    if (formValue.ffmpeg && !/^\s*$/.test(formValue.ffmpeg)) {
      localStorage.setItem('FFMPEG_PATH', formValue.ffmpeg);
    } else {
      localStorage.removeItem('FFMPEG_PATH');
    }

    messageApi.success('配置成功！');
    handleCloseFFmpegOptionModalClick(event);
  }

  // 清除配置和完全关闭
  function handleResetFFmpegOptionClick(): void {
    form.resetFields();
  }

  // 选择ffmpeg文件的位置
  async function handleSelectFFmpegClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openFile'] });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    form.setFieldsValue({
      ffmpeg: result.filePaths[0]
    });
  }

  return (
    <Fragment>
      <HelpButtonGroup navId="ffmpeg-option">
        <Button type="primary"
          id="ffmpeg-options"
          danger={ true }
          icon={ IconFFmpeg }
          onClick={ handleOpenFFmpegOptionClick }
        >
          FFmpeg配置
        </Button>
      </HelpButtonGroup>
      <span className={ classNames('inline-block ml-[6px] text-[12px]', style.tips) }>
        <IconSwapLeftOutlined className="mr-[3px] text-[16px]" />
        使用前先配置FFmpeg
      </span>
      <Modal title="FFmpeg配置"
        open={ visible }
        width={ 600 }
        centered={ true }
        maskClosable={ false }
        afterClose={ handleResetFFmpegOptionClick }
        onOk={ handleSetFFmpegClick }
        onCancel={ handleCloseFFmpegOptionModalClick }
      >
        <Form className="h-[200px]" form={ form }>
          <Form.Item name="ffmpeg" label="可执行文件">
            <Input />
          </Form.Item>
          <div className="mb-[32px] text-right">
            <Button icon={ <IconDownloadOutlined /> } onClick={ handleOpenIssuesClick }>FFmpeg下载</Button>
            <Button className="ml-[6px]" type="primary" danger={ true } onClick={ handleResetFFmpegOptionClick }>
              清除配置
            </Button>
            <Button className="ml-[6px]" onClick={ handleSelectFFmpegClick }>选择文件</Button>
          </div>
          <Alert type="info" message="配置FFmpeg的地址，或自动使用环境变量的地址。播放视频功能需要配置后重新启动软件。" />
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default FFmpegOption;