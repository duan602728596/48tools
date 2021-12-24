import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import type { OpenDialogReturnValue } from 'electron';
import { dialog } from '@electron/remote';
import type { ReactElement, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Form, Button, Input, InputNumber, Card } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';
import classNames from 'classnames';
import style from './cutForm.sass';
import { setCutListAdd } from '../reducers/videoCut';
import { getFullTime } from './function';
import type { CutItem } from '../types';

const timeRules: Rule[] = [{
  type: 'integer',
  min: 0,
  max: 59,
  message: '请输入大于等于0，小于等于59的整数',
  transform: (v: any): number => v ? Number(v) : 0
}];

interface FormValue {
  file: string;
  startH?: string | number;
  startM?: string | number;
  startS?: string | number;
  endH?: string | number;
  endM?: string | number;
  endS?: string | number;
}

/* 裁剪表单 */
function CutForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [form]: [FormInstance] = Form.useForm();
  const { setFieldsValue, resetFields }: FormInstance = form;

  // 选择文件
  async function handleOpenVideoFileClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !(result?.filePaths?.length)) return;

    setFieldsValue({ file: result.filePaths[0] });
  }

  // 添加到队列
  function handleFormSubmit(value: FormValue): void {
    const parseResult: ParsedPath = path.parse(value.file);
    const data: CutItem = {
      id: randomUUID(),
      file: value.file,
      name: parseResult.base,
      startTime: getFullTime(value.startH, value.startM, value.startS),
      endTime: getFullTime(value.endH, value.endM, value.endS)
    };

    dispatch(setCutListAdd(data));
    resetFields();
  }

  return (
    <Card className={ classNames('min-w-[880px]', style.card) }>
      <Form form={ form } onFinish={ handleFormSubmit }>
        <Form.Item label="选择需要裁剪的视频">
          <div className="inline-block w-[592px] mr-[6px]">
            <Form.Item name="file" rules={ [{ required: true, whitespace: true, message: '请选择视频文件' }] } noStyle={ true }>
              <Input readOnly={ true } />
            </Form.Item>
          </div>
          <Button onClick={ handleOpenVideoFileClick }>选择文件</Button>
        </Form.Item>
        <Form.Item label="裁剪时间">
          <label>开始时间：</label>
          <Form.Item name="startH" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="时" />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="startM" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="分" />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="startS" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="秒" />
          </Form.Item>
          <label className="ml-[12px]">结束时间：</label>
          <Form.Item name="endH" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="时" />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="endM" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="分" />
          </Form.Item>
          <span className={ style.maohao }>:</span>
          <Form.Item name="endS" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="秒" />
          </Form.Item>
        </Form.Item>
        <Button.Group>
          <Button onClick={ (event: MouseEvent<HTMLButtonElement>): void => resetFields() }>重置</Button>
          <Button type="primary" htmlType="submit">添加到裁剪队列</Button>
        </Button.Group>
      </Form>
    </Card>
  );
}

export default CutForm;