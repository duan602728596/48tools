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
import {
  requestPugvSeason,
  requestPugvPlayurl,
  type DashVideoInfo,
  type DashSupportFormats,
  type DashVideoItem,
  type PugvSeason,
  type PugvSeasonEpisodesItem,
  type PugvSeasonPlayUrl
} from '@48tools-api/bilibili/download';
import {
  parseVideoUrlV2,
  parseAudioUrl,
  parseBangumiVideo,
  parseVideoUrlDASH,
  type ParseVideoUrlV2ObjectResult,
  type ParseVideoUrlDASHObjectResult
} from '../function/parseBilibiliUrl';
import { setAddDownloadList } from '../../reducers/bilibiliDownload';

/* 视频分类 */
const bilibiliVideoTypesOptions: Array<DefaultOptionType> = [
  { value: 'bv', label: '视频（BV）' },
  { value: 'av', label: '视频（av）' },
  { value: 'au', label: '音频（au）' },
  { value: 'ep', label: '番剧（ep）' },
  { value: 'ss', label: '番剧（ss）' },
  { value: 'pugv_ep', label: '课程（ep）' }
];

type TypesResult = { [key: string]: string };
export const bilibiliVideoTypesMap: TypesResult = bilibiliVideoTypesOptions.reduce(
  function(result: TypesResult, item: { label: string; value: string }, index: number): TypesResult {
    result[item.value] = item.label;

    return result;
  }, {});

interface dashInfo {
  dash: DashVideoInfo;
  supportFormats: Array<DashSupportFormats>;
  pic: string;
  title: string;
}

/* 添加下载信息 */
function AddForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);
  const [dash, setDash]: [dashInfo | undefined, D<S<dashInfo | undefined>>] = useState(undefined);
  const [modalLoading, startModalLoadingTransition]: [boolean, TransitionStartFunction] = useTransition();
  const [form]: [FormInstance] = Form.useForm();

  // 选择DASH video并准备下载
  function handleDownloadDashVideoClick(item: DashSupportFormats, event: MouseEvent): void {
    if (!dash) return;

    const videoItem: DashVideoItem = dash.dash.video.find((o: DashVideoItem): boolean => o.id === item.quality)
      ?? dash.dash.video[0];

    const videoUrl: string = videoItem.backupUrl?.[0]
      ?? videoItem.backup_url?.[0]
      ?? videoItem.baseUrl
      ?? videoItem.base_url;
    const audioUrl: string = dash.dash.audio[0].backupUrl?.[0]
      ?? dash.dash.audio[0].backup_url?.[0]
      ?? dash.dash.audio[0].baseUrl
      ?? dash.dash.audio[0].base_url;
    const formValue: FormStore = form.getFieldsValue();

    dispatch(setAddDownloadList({
      qid: randomUUID(),
      durl: '',
      pic: dash.pic,
      type: formValue.type,
      id: formValue.id,
      page: formValue.page ?? 1,
      dash: { video: videoUrl, audio: audioUrl },
      title: dash.title
    }));
    setVisible(false);
  }

  // 课程的处理
  // 测试：https://www.bilibili.com/cheese/play/ep205797?csource=private_space_tougao_null
  async function getPugvData(formValue: FormStore, proxy: string | undefined): Promise<void> {
    const resPugvSeason: PugvSeason = await requestPugvSeason(formValue.id, proxy);
    const resItem: PugvSeasonEpisodesItem | undefined = resPugvSeason.data.episodes.find(
      (o: PugvSeasonEpisodesItem) => `${ o.id }` === formValue.id);

    if (resItem) {
      const resPlayUrl: PugvSeasonPlayUrl = await requestPugvPlayurl(formValue.id, resItem.aid, resItem.cid, proxy);

      if (resPlayUrl?.data?.dash) {
        setDash({
          dash: resPlayUrl.data.dash,
          supportFormats: resPlayUrl.data.support_formats,
          pic: resItem.cover,
          title: `${ resPugvSeason.data.title }_${ resItem.title }`
        });
      } else {
        messageApi.warning('没有获取到媒体地址！');
      }
    } else {
      messageApi.warning('没有获取到媒体地址！');
    }
  }

  // 选择DASH video
  async function handleDASHVideoClick(event: MouseEvent): Promise<void> {
    let formValue: FormStore;

    try {
      formValue = await form.validateFields();
    } catch (err) {
      return console.error(err);
    }

    if (!['bv', 'av', 'pugv_ep'].includes(formValue.type)) {
      messageApi.warning('不支持的视频类型！');

      return;
    }

    startModalLoadingTransition(async (): Promise<void> => {
      try {
        const proxy: string | undefined = (formValue.useProxy && formValue.proxy && !/^\s*$/.test(formValue.proxy))
          ? formValue.proxy : undefined;

        // 课程的处理
        if (formValue.type === 'pugv_ep') {
          return await getPugvData(formValue, proxy);
        }

        const res: ParseVideoUrlDASHObjectResult | undefined = await parseVideoUrlDASH(
          formValue.type, formValue.id, formValue.page, proxy);

        if (res && res?.videoData?.dash) {
          setDash({
            dash: res.videoData.dash,
            supportFormats: res.videoData.support_formats,
            pic: res.pic,
            title: res.title
          });
        } else {
          messageApi.warning('没有获取到媒体地址！');
        }
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
        const proxy: string | undefined = (formValue.useProxy && formValue.proxy && !/^\s*$/.test(formValue.proxy))
          ? formValue.proxy : undefined;

        // 课程的处理
        if (formValue.type === 'pugv_ep') {
          return await getPugvData(formValue, proxy);
        }

        let result: string | ParseVideoUrlV2ObjectResult | void;

        if (formValue.type === 'au') {
          // 下载音频
          result = await parseAudioUrl(formValue.id, proxy);
        } else if (formValue.type === 'ss' || formValue.type === 'ep') {
          // 下载番剧
          result = await parseBangumiVideo(formValue.type, formValue.id, proxy);
        } else {
          // 下载av、bv视频，会返回视频封面
          result = await parseVideoUrlV2(formValue.type, formValue.id, formValue.page, proxy);
        }

        if (result) {
          dispatch(setAddDownloadList({
            qid: randomUUID(),
            durl: typeof result === 'object' ? result.flvUrl : result,
            pic: typeof result === 'object' ? result.pic : undefined,
            type: formValue.type,
            id: formValue.id,
            page: formValue.page ?? 1,
            title: typeof result === 'object' ? result.title : undefined
          }));
          setVisible(false);
        } else {
          messageApi.warning('没有获取到媒体地址！');
        }
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
    return (dash?.supportFormats ?? []).map((item: DashSupportFormats, index: number): ReactElement => {
      return (
        <Button key={ item.new_description }
          className="mb-[6px]"
          size="small"
          block={ true }
          onClick={ (event: MouseEvent): void => handleDownloadDashVideoClick(item, event) }
        >
          { item.new_description }
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
            <Form.Item name="id" label="ID" rules={ [{ required: true, message: '必须输入视频ID', whitespace: true }] }>
              <Input />
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
          <div className="w-[200px] mx-auto" data-test-id="bilibili-DASH-video">{ supportFormatsRender() }</div>
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default AddForm;