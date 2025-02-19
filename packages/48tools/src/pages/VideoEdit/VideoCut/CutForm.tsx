import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import type { ParsedPath } from 'node:path';
import type { OpenDialogReturnValue } from 'electron';
import { useState, useEffect, type ReactElement, type MouseEvent, type Dispatch as D, type SetStateAction as S } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Form, Button, Input, InputNumber, Card, Checkbox, Select, Space, type FormInstance } from 'antd';
import type { Rule } from 'antd/es/form';
import type { DefaultOptionType } from 'rc-select/es/Select';
import style from './cutForm.sass';
import { showOpenDialog } from '../../../utils/remote/dialog';
import { setCutListAdd } from '../reducers/videoCut';
import { getFullTime, getHwaccels } from './function/function';
import ButtonLink from '../../../components/ButtonLink/ButtonLink';
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
  reEncoding?: boolean | undefined;
  hwaccel?: string | undefined;
}

/* 裁剪表单 */
function CutForm(props: {}): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [hwaccelsOptions, setHwaccelsOptions]: [Array<DefaultOptionType>, D<S<Array<DefaultOptionType>>>] = useState([
    { label: '无', value: '无' },
    { label: 'auto', value: 'auto' }
  ]);
  const [form]: [FormInstance] = Form.useForm();
  const { setFieldsValue, resetFields }: FormInstance = form;

  // 选择文件
  async function handleOpenVideoFileClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await showOpenDialog({ properties: ['openFile'] });

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
      endTime: getFullTime(value.endH, value.endM, value.endS),
      reEncoding: value.reEncoding,
      hwaccel: value.hwaccel
    };

    dispatch(setCutListAdd(data));
    resetFields();
  }

  useEffect(function() {
    getHwaccels().then((r: Array<string>): void => {
      setHwaccelsOptions((prevState: Array<DefaultOptionType>): Array<DefaultOptionType> => prevState.concat(
        r.map((o: string): DefaultOptionType => ({ label: o, value: o }))
      ));
    });
  }, []);

  return (
    <Card className="min-w-[880px] !mb-[8px]" size="small">
      <Form form={ form } initialValues={{ hwaccel: '无' }} onFinish={ handleFormSubmit }>
        <Form.Item label="选择需要裁剪的视频">
          <div className="inline-block w-[592px] mr-[6px]">
            <Form.Item name="file" rules={ [{ required: true, whitespace: true, message: '请选择视频文件' }] } noStyle={ true }>
              <Input readOnly={ true } />
            </Form.Item>
          </div>
          <Button onClick={ handleOpenVideoFileClick }>选择文件</Button>
        </Form.Item>
        <Form.Item label="裁剪时间">
          {/* 开始时间 */}
          <label>开始时间：</label>
          <Form.Item name="startH" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="时" />
          </Form.Item>
          <span className="mx-[6px]">:</span>
          <Form.Item name="startM" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="分" />
          </Form.Item>
          <span className="mx-[6px]">:</span>
          <Form.Item name="startS" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="秒" />
          </Form.Item>
          {/* 结束时间 */}
          <label className="ml-[12px]">结束时间：</label>
          <Form.Item name="endH" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="时" />
          </Form.Item>
          <span className="mx-[6px]">:</span>
          <Form.Item name="endM" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="分" />
          </Form.Item>
          <span className="mx-[6px]">:</span>
          <Form.Item name="endS" rules={ timeRules } noStyle={ true }>
            <InputNumber placeholder="秒" />
          </Form.Item>
        </Form.Item>
        <div className="flex">
          <div className="content-center">
            <Form.Item className="inline-block mb-0 select-none" name="reEncoding" valuePropName="checked">
              <Checkbox>精确剪辑，重新编码（速度较慢）</Checkbox>
            </Form.Item>
            <Form.Item className="inline-block mr-[8px] mb-0" name="hwaccels" label="GPU加速">
              <Select className={ style.select } options={ hwaccelsOptions } />
            </Form.Item>
          </div>
          <div>
            <Space.Compact>
              <Button onClick={ (event: MouseEvent): void => resetFields() }>重置</Button>
              <Button type="primary" htmlType="submit">添加到裁剪队列</Button>
            </Space.Compact>
          </div>
          <div className="grow text-right">
            <ButtonLink linkProps={{ to: '/' }} buttonProps={{ type: 'primary', danger: true }}>返回</ButtonLink>
          </div>
        </div>
      </Form>
    </Card>
  );
}

export default CutForm;