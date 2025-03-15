import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useTransition,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type TransitionStartFunction
} from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Modal, Form, Input, Select, InputNumber, Checkbox, message, type FormInstance } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { Store as FormStore } from 'antd/es/form/interface';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { setAddDownloadList } from '../../reducers/bilibiliDownload';
import HelpButtonGroup from '../../../../components/HelpButtonGroup/HelpButtonGroup';
import {
  BilibiliScrapy,
  BilibiliVideoType,
  type BilibiliVideoInfoItem,
  type BilibiliVideoResultItem,
  type ScrapyError
} from '../../../../scrapy/bilibili/BilibiliScrapy';
import type { DashInfoV2 } from '../../types';

/* 视频分类 */
const bilibiliVideoTypesOptions: Array<DefaultOptionType> = [
  {
    label: '视频',
    options: [
      { value: BilibiliVideoType.BV, label: '视频 (BV)' },
      { value: BilibiliVideoType.AV, label: '视频 (av)' }
    ]
  },
  {
    label: '音频',
    options: [{ value: BilibiliVideoType.AU, label: '音频 (au)' }]
  },
  {
    label: '番剧',
    options: [
      { value: BilibiliVideoType.EP, label: '番剧 (ep)' },
      { value: BilibiliVideoType.SS, label: '番剧 (ss)' }
    ]
  },
  {
    label: '课程',
    options: [
      { value: BilibiliVideoType.CHEESE_EP, label: '课程 (ep)' },
      { value: BilibiliVideoType.CHEESE_SS, label: '课程 (ss)' }
    ]
  }
];

export const bilibiliVideoTypesMap: Record<string, string> = bilibiliVideoTypesOptions.reduce(
  function(result: Record<string, string>, item: DefaultOptionType, index: number): Record<string, string> {
    for (const option of item.options) {
      result[option.value] = option.label;
    }

    return result;
  }, {});

/* 添加下载信息 */
function AddForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [dash, setDash]: [DashInfoV2 | undefined, D<S<DashInfoV2 | undefined>>] = useState(undefined);
  const [modalLoading, startModalLoadingTransition]: [boolean, TransitionStartFunction] = useTransition();
  const [form]: [FormInstance] = Form.useForm();

  // 选择DASH video并准备下载
  function handleDownloadDashVideoClick(item: BilibiliVideoInfoItem, event: MouseEvent): void {
    if (!dash) return;

    const formValue: FormStore = form.getFieldsValue();

    dispatch(setAddDownloadList({
      qid: randomUUID(),
      durl: '',
      pic: dash.pic,
      type: formValue.type,
      id: formValue.id,
      page: formValue.page ?? 1,
      dash: { video: item.videoUrl, audio: item.audioUrl! },
      title: dash.title
    }));
    setVisible(false);
  }

  // 通用的获取bilibiliScrapy的方法
  async function getBilibiliScrapy(formValue: FormStore): Promise<BilibiliScrapy | undefined> {
    const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
      type: formValue.type,
      id: formValue.id,
      page: formValue.page,
      useProxy: formValue.useProxy,
      proxy: formValue.proxy
    });

    await bilibiliScrapy.parse();

    if (bilibiliScrapy.error) {
      messageApi[bilibiliScrapy.error.level](bilibiliScrapy.error.message);

      return;
    }

    const err: ScrapyError | undefined = await bilibiliScrapy.asyncLoadVideoInfoByPage();

    if (err) {
      messageApi[err.level](err.message);

      return;
    }

    return bilibiliScrapy;
  }

  // 选择DASH video
  // 测试：https://www.bilibili.com/cheese/play/ep205797?csource=private_space_tougao_null
  async function handleDASHVideoClick(event: MouseEvent): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    startModalLoadingTransition(async (): Promise<void> => {
      try {
        const bilibiliScrapy: BilibiliScrapy | undefined = await getBilibiliScrapy(formValue);

        if (!bilibiliScrapy) return;

        const item: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();

        setDash({
          dash: item.videoInfo,
          pic: item.cover,
          title: bilibiliScrapy.title === item.title ? item.title : `${ bilibiliScrapy.title } ${ item.title }`
        });
      } catch (err) {
        messageApi.error('地址解析失败！');
        console.error(err);
      }
    });
  }

  // 确定添加视频
  async function handleAddDownloadQueueClick(event: MouseEvent): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    startModalLoadingTransition(async (): Promise<void> => {
      try {
        const bilibiliScrapy: BilibiliScrapy | undefined = await getBilibiliScrapy(formValue);

        if (!bilibiliScrapy) return;

        const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
        const videoInfoItem: BilibiliVideoInfoItem = bilibiliScrapy.findVideoInfo();
        const obj: {
          dash?: { video: string; audio: string };
          durl: string;
        } = videoInfoItem.audioUrl ? {
          dash: {
            video: videoInfoItem.videoUrl,
            audio: videoInfoItem.audioUrl!
          },
          durl: ''
        } : {
          durl: videoInfoItem.videoUrl
        };

        dispatch(setAddDownloadList({
          qid: randomUUID(),
          pic: videoResultItem.cover,
          type: formValue.type,
          id: formValue.id,
          page: formValue.page ?? 1,
          title: bilibiliScrapy.title === videoResultItem.title ? videoResultItem.title : `${ bilibiliScrapy.title } ${ videoResultItem.title }`,
          ...obj
        }));
        setVisible(false);
      } catch (err) {
        messageApi.error('地址解析失败！');
        console.error(err);
      }
    });
  }

  // 返回
  function handleLevelDASHVideoClick(event: MouseEvent): void {
    setDash(undefined);
  }

  // 关闭窗口后重置表单
  function handleAddModalClose(): void {
    form.resetFields(['type', 'id', 'page']);
    setDash(undefined);
  }

  // 打开弹出层
  function handleOpenAddModalClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭弹出层
  function handleCloseAddModalClick(event: MouseEvent): void {
    setVisible(false);
  }

  // 渲染supportFormats
  function supportFormatsRender(): Array<ReactElement> {
    return (dash?.dash ?? []).map((item: BilibiliVideoInfoItem, index: number): ReactElement => {
      return (
        <Button key={ `${ item.quality }-${ index }` }
          className="mb-[6px]"
          size="small"
          block={ true }
          onClick={ (event: MouseEvent): void => handleDownloadDashVideoClick(item, event) }
        >
          { item.qualityDescription }
        </Button>
      );
    });
  }

  return (
    <Fragment>
      <Button type="primary" data-test-id="bilibili-download-add-btn" onClick={ handleOpenAddModalClick }>添加下载任务</Button>
      <Modal open={ visible }
        title={ dash ? '选择其他分辨率' : '添加下载任务' }
        width={ 480 }
        centered={ true }
        maskClosable={ false }
        confirmLoading={ modalLoading }
        afterClose={ handleAddModalClose }
        footer={
          dash ? (
            <Button onClick={ handleLevelDASHVideoClick }>返回</Button>
          ) : (
            <Fragment>
              <Button onClick={ handleCloseAddModalClick }>取消</Button>
              <Button key="dash-btn" onClick={ handleDASHVideoClick }>选择其他分辨率</Button>
              <Button key="ok-btn" type="primary" onClick={ handleAddDownloadQueueClick }>确定</Button>
            </Fragment>
          )
        }
        onCancel={ dash ? handleLevelDASHVideoClick : handleCloseAddModalClick }
      >
        <div className="h-[210px]">
          {/* add的表单 */}
          <Form className={ dash ? 'hidden' : undefined }
            form={ form }
            initialValues={{ type: 'bv' }}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item name="type" label="下载类型" data-test-id="bilibili-download-form-type">
              <Select options={ bilibiliVideoTypesOptions } />
            </Form.Item>
            <Form.Item label="ID">
              <HelpButtonGroup spaceCompactProps={{ className: 'w-full' }} navId="bilibili-video-id" tooltipTitle="输入正确的视频ID">
                <Form.Item name="id" rules={ [{ required: true, message: '必须输入视频ID', whitespace: true }] } noStyle={ true }>
                  <Input />
                </Form.Item>
              </HelpButtonGroup>
            </Form.Item>
            <Form.Item name="page" label="Page">
              <InputNumber />
            </Form.Item>
            <Form.Item label="代理地址">
              <div className="flex">
                <div className="leading-[32px]">
                  <Form.Item name="useProxy" noStyle={ true } valuePropName="checked">
                    <Checkbox>开启</Checkbox>
                  </Form.Item>
                </div>
                <div className="grow">
                  <Form.Item name="proxy" noStyle={ true }>
                    <Input placeholder="代理地址" />
                  </Form.Item>
                </div>
              </div>
            </Form.Item>
          </Form>
          {/* DASH视频下载 */}
          <div className="w-full h-full overflow-auto" data-test-id="bilibili-DASH-video">
            <div className="mx-auto w-[200px]">{ supportFormatsRender() }</div>
          </div>
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default AddForm;