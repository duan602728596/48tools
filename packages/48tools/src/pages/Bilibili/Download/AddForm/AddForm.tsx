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
import { Button, Modal, Form, Input, Select, InputNumber, Checkbox, message, Divider, type FormInstance } from 'antd';
import type { Rule, RuleObject } from 'antd/es/form';
import type { Store as FormStore } from 'antd/es/form/interface';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { setAddDownloadList } from '../../reducers/bilibiliDownload';
import HelpButtonGroup from '../../../../components/HelpButtonGroup/HelpButtonGroup';
import {
  BilibiliScrapy,
  BilibiliVideoType,
  type BilibiliScrapyOptions,
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

  /* 验证id或者url必须有一个 */
  const idAndUrlRule: Rule = {
    async validator(rule: RuleObject, value: string | undefined): Promise<void> {
      const id: string | undefined = form.getFieldValue('id'),
        url: string | undefined = form.getFieldValue('url');

      if (url && !/^\s*$/.test(url)) {
        return await Promise.resolve();
      } else if (id && !/^\s*$/.test(id)) {
        return await Promise.resolve();
      } else {
        throw new Error(typeof rule.message === 'string' ? rule.message : undefined);
      }
    },
    message: '必须输入视频ID或者视频URL'
  };

  // 选择DASH video并准备下载
  function handleDownloadDashVideoClick(item: BilibiliVideoInfoItem, event: MouseEvent): void {
    if (!dash) return;

    dispatch(setAddDownloadList({
      qid: randomUUID(),
      durl: '',
      pic: dash.pic,
      type: dash.type,
      id: dash.id,
      page: dash.page ?? 1,
      dash: { video: item.videoUrl, audio: item.audioUrl! },
      title: dash.title
    }));
    setVisible(false);
  }

  // 通用的获取bilibiliScrapy的方法
  async function getBilibiliScrapy(formValue: FormStore): Promise<BilibiliScrapy | undefined> {
    const options: BilibiliScrapyOptions = formValue.url ? { url: formValue.url } : {
      type: formValue.type,
      id: formValue.id,
      page: formValue.page
    };
    const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
      ...options,
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
          type: bilibiliScrapy.type!,
          id: bilibiliScrapy.id!,
          title: bilibiliScrapy.title === item.title ? item.title : `${ bilibiliScrapy.title } ${ item.title }`,
          page: bilibiliScrapy.page,
          pic: item.cover
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
          type: bilibiliScrapy.type!,
          id: bilibiliScrapy.id!,
          page: bilibiliScrapy.page ?? 1,
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
    form.resetFields(['type', 'id', 'page', 'url']);
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
        width={ 500 }
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
        <div className="h-[340px]">
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
                <Form.Item name="id" rules={ [idAndUrlRule] } noStyle={ true }>
                  <Input />
                </Form.Item>
              </HelpButtonGroup>
            </Form.Item>
            <Form.Item name="page" label="Page">
              <InputNumber />
            </Form.Item>
            <Divider plain={ true }>输入视频地址，直接解析B站视频</Divider>
            <Form.Item name="url" label="视频地址" rules={ [idAndUrlRule, { pattern: /ht{2}ps?:\/{2}(w{3})?\.bilibili\.com\//i, message: '必须填写有效的B站地址' }] }>
              <Input allowClear={ true } />
            </Form.Item>
            <Divider plain={ true }>代理设置</Divider>
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