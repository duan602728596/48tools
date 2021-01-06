import { remote, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { Form, Button, Input, InputNumber, Card } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';
import style from './cutForm.sass';

const timeRules: Rule[] = [{
  type: 'integer',
  min: 0,
  max: 59,
  message: '请输入大于等于0，小于等于59的整数',
  transform: (v: any): number => v ? Number(v) : 0
}];

/* 裁剪表单 */
function CutForm(props: {}): ReactElement {
  const [form]: [FormInstance] = Form.useForm();
  const { setFieldsValue }: FormInstance = form;

  // 选择文件
  async function handleOpenVideoFileClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !(result?.filePaths?.length)) return;

    setFieldsValue({ file: result.filePaths[0] });
  }

  return (
    <Card className={ style.card }>
      <Form form={ form }>
        <Form.Item label="选择需要裁剪的视频">
          <Form.Item name="file" rules={ [{ required: true, whitespace: true, message: '请选择视频文件' }] } noStyle={ true }>
            <Input className={ style.fileInput } readOnly={ true } />
          </Form.Item>
          <Button onClick={ handleOpenVideoFileClick }>选择文件</Button>
        </Form.Item>
        <Form.Item label="裁剪时间">
          <label>开始时间：</label>
          <Form.Item name="startH" rules={ timeRules } noStyle={ true }>
            <InputNumber />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="startM" rules={ timeRules } noStyle={ true }>
            <InputNumber />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="startS" rules={ timeRules } noStyle={ true }>
            <InputNumber />
          </Form.Item>
          <label className={ style.labelMarginLeft }>结束时间：</label>
          <Form.Item name="endH" rules={ timeRules } noStyle={ true }>
            <InputNumber />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="endM" rules={ timeRules } noStyle={ true }>
            <InputNumber />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="endS" rules={ timeRules } noStyle={ true }>
            <InputNumber />
          </Form.Item>
        </Form.Item>
        <Button.Group>
          <Button>重置</Button>
          <Button type="primary" htmlType="submit">添加到裁剪队列</Button>
        </Button.Group>
      </Form>
    </Card>
  );
}

export default CutForm;