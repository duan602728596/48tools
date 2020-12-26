import { useState, ReactElement, ReactNodeArray, Dispatch as D, SetStateAction as S } from 'react';
import { Form, Select, message, Button } from 'antd';
import type { FormInstance } from 'antd/es/form';
import style from './getLiveUrl.sass';
import { parseInLive } from './parseLive48Website';

/* 抓取直播信息表单 */
function GetLiveUrl(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();
  const [liveUrlInfo, setLiveUrlInfo]: [
    Array<{ label: string; value: string }>,
    D<S<Array<{ label: string; value: string }>>>
  ] = useState([]);

  // 选择团体后获取公演直播信息
  async function handleLiveTypeSelect(value: string): Promise<void> {
    const liveInfo: Array<{ label: string; value: string }> = await parseInLive(value);

    setLiveUrlInfo(liveInfo);
    form.resetFields(['live']);

    if (liveInfo.length === 0) message.warn('当前没有公演！');
  }

  // 渲染公演的选择
  function liveSelectOptionRender(): ReactNodeArray {
    return liveUrlInfo.map((item: { label: string; value: string }, index: number): ReactElement => {
      return <Select.Option key={ item.value } value={ item.value }>{ item.label }</Select.Option>;
    });
  }

  return (
    <Form form={ form } initialValues={{ quality: 'chao' }} component={ false }>
      <Form.Item name="type" noStyle={ true }>
        <Select className={ style.typeSelect } placeholder="选择团体" onSelect={ handleLiveTypeSelect }>
          <Select.Option value="snh48">SNH48</Select.Option>
          <Select.Option value="bej48">BEJ48</Select.Option>
          <Select.Option value="gnz48">GNZ48</Select.Option>
          <Select.Option value="ckg48">CKG48</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="live" noStyle={ true }>
        <Select className={ style.liveSelect } placeholder="选择公演">{ liveSelectOptionRender() }</Select>
      </Form.Item>
      <Form.Item name="quality" noStyle={ true }>
        <Select className={ style.qualitySelect } placeholder="画质">
          <Select.Option value="chao">超清</Select.Option>
          <Select.Option value="gao">高清</Select.Option>
          <Select.Option value="liuchang">流畅</Select.Option>
        </Select>
      </Form.Item>
      <Button className={ style.startBtn } type="primary">开始直播录制</Button>
    </Form>
  );
}

export default GetLiveUrl;