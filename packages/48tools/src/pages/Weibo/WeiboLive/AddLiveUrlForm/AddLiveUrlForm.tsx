import type { ReactElement } from 'react';
import * as PropTypes from 'prop-types';
import { Form, Input, Button, Space, App, type FormInstance } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import { match, type Match, type MatchFunction } from 'path-to-regexp';
import { requestPcLiveJson, type PcLiveJson } from '@48tools-api/weibo';
import { checkEmptyString } from '../function/helper';
import type { LiveItem } from '../../types';

const weiboLiveMatch: MatchFunction = match('/l/wblive/p/show/:liveId');

interface AddLiveUrlFormProps {
  onGetLiveInfoCallback(info: Omit<LiveItem, 'qid' | 'worker' | 'status'>): void | Promise<void>;
}

/* 解析、添加直播地址 */
function AddLiveUrlForm(props: AddLiveUrlFormProps): ReactElement {
  const { message: messageApi }: useAppProps = App.useApp();
  const [form]: [FormInstance] = Form.useForm();

  // 开始录制
  async function handleStartRecordLiveClick({ liveValue }: { liveValue: string | undefined }): Promise<void> {
    if (!liveValue) {
      messageApi.warning('请输入直播间地址或ID。');

      return;
    }

    let liveId: string;

    try {
      const url: URL = new URL(liveValue);

      if (!/weibo\.com/i.test(url.hostname)) {
        messageApi.warning('请输入正确的微博直播间地址!');

        return;
      }

      const matchResult: Match = weiboLiveMatch(url.pathname);

      if (typeof matchResult === 'object') {
        liveId = matchResult.params['liveId'];
      } else {
        messageApi.warning('无法解析地址中的直播间ID!');

        return;
      }
    } catch {
      liveId = liveValue;
    }

    try {
      const res: PcLiveJson = await requestPcLiveJson(liveId);

      if (res.code === 100_000) {
        const liveUrl: string | undefined = checkEmptyString(res.data.live_origin_flv_url)
          || checkEmptyString(res.data.live_origin_hls_url)
          || checkEmptyString(res.data.replay_origin_url);

        if (!liveUrl) {
          messageApi.warning('无法获取直播地址！');

          return;
        }

        props.onGetLiveInfoCallback({
          liveId,
          url: liveUrl,
          title: res.data.title
        });
      } else {
        messageApi.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      messageApi.error('获取直播间信息失败。');
    }
  }

  return (
    <Form form={ form } onFinish={ handleStartRecordLiveClick }>
      <Space>
        <Form.Item name="liveValue" noStyle={ true }>
          <Input className="w-[200px]" placeholder="输入直播间地址或ID" />
        </Form.Item>
        <Button type="primary" htmlType="submit">开始录制</Button>
      </Space>
    </Form>
  );
}

AddLiveUrlForm.propTypes = {
  onGetLiveInfoCallback: PropTypes.func.isRequired
};

export default AddLiveUrlForm;