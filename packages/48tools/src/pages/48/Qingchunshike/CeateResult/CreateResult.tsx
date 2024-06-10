import type { SaveDialogReturnValue } from 'electron';
import * as fsP from 'node:fs/promises';
import { Fragment, useEffect, type ReactElement, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Card, Alert, Form, DatePicker, Select, Button, Space, message, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import * as classNames from 'classnames';
import style from './createResult.sass';
import { showSaveDialog } from '../../../../utils/remote/dialog';
import {
  IDBCursorQingchunshikeUserList,
  IDBDeleteQingchunshikeUserItem,
  selectorsObject,
  setLoading,
  type QingchunshikeInitialState
} from '../../reducers/qingchunshike';
import dbConfig from '../../../../utils/IDB/IDBConfig';
import { fileTimeFormat } from '../../../../utils/utils';
import {
  selectorsObject as pocket48LoginSelectorsObject,
  type Pocket48LoginInitialState
} from '../../../../functionalComponents/Pocket48Login/reducers/pocket48Login';
import calculate, { type CalculateResult } from '../function/calculate';
import { Pocket48Login } from '../../../../functionalComponents/Pocket48Login/enum';
import type { QingchunshikeUserItem } from '../../types';

/* redux selector */
type RSelector = QingchunshikeInitialState & Pocket48LoginInitialState;
type RState = {
  qingchunshike: QingchunshikeInitialState;
  pocket48Login: Pocket48LoginInitialState;
};

const selector: Selector<RState, RSelector> = createStructuredSelector({
  ...pocket48LoginSelectorsObject,
  ...selectorsObject
});

/* 生成结果 */
function CreateResult(props: {}): ReactElement {
  const { userList, loading, log, userInfo }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();

  // 生成数据
  async function handleCreateResultClick(event: MouseEvent): Promise<void> {
    let formValue: { option: string; startTime: Dayjs; endTime: Dayjs };

    try {
      formValue = await form.validateFields();
    } catch (err) {
      console.error(err);

      return;
    }

    if (!userInfo) {
      messageApi.error('请先登录。');

      return;
    }

    const appDataDir: string | null = localStorage.getItem(Pocket48Login.AppDataDir);

    if (!appDataDir) {
      messageApi.warning('您需要配置App Data目录。');

      return;
    }

    const after: number = formValue.endTime.diff(formValue.startTime, 'month');

    if (after > 6 && after < 0) {
      messageApi.warning('时间必须在6个月内。');

      return;
    }

    const userItem: QingchunshikeUserItem | undefined = userList.find((o: QingchunshikeUserItem): boolean => o.id === formValue.option);

    if (!userItem) return;

    const filename: string = `${ userItem.description }_${ userItem.serverId }_${ userItem.channelId }_${ userItem.liveRoomId }_${
      dayjs().format(fileTimeFormat)
    }.txt`;
    const result: SaveDialogReturnValue = await showSaveDialog({
      defaultPath: filename
    });

    if (result.canceled || !result.filePath) return;

    dispatch(setLoading(true));

    try {
      const calculateResult: CalculateResult = await calculate({
        user: userItem,
        st: formValue.startTime.valueOf(),
        et: formValue.endTime.valueOf(),
        accid: userInfo.accid,
        pwd: userInfo.pwd,
        appDataDir
      });
      const text: string = `################################################################
  serverId: ${ userItem.serverId }
 channelId: ${ userItem.channelId }
liveRoomId: ${ userItem.liveRoomId }
################################################################
${ userItem.description }
${ formValue.startTime.format('YYYY-MM-DD HH:mm:ss') } - ${ formValue.endTime.format('YYYY-MM-DD HH:mm:ss') }

【数据统计可能不准确，仅供参考。】
################################################################
总分数：${ (calculateResult.qchatCalculateResult.all + calculateResult.nimCalculateResult.all).toFixed(1) }
################################################################
房间：${ calculateResult.qchatCalculateResult.all.toFixed(1) }
${ calculateResult.qchatCalculateResult.tpNumList.map(([a, b]: [string, number]): string => `${ a }：${ b }`).join('\n') }
################################################################
直播：${ calculateResult.nimCalculateResult.all.toFixed(1) }
${ calculateResult.nimCalculateResult.tpNumList.map(([a, b]: [string, number]): string => `${ a }：${ b }`).join('\n') }
################################################################`;

      await fsP.writeFile(result.filePath, text, { encoding: 'utf-8' });
      messageApi.success('生成成功。');
    } catch (err) {
      console.error(err);
      messageApi.error('生成失败。');
    }

    dispatch(setLoading(false));
  }

  // 删除当前配置
  function handleDeleteOptionClick(event: MouseEvent): void {
    const item: QingchunshikeUserItem | undefined = userList.find(
      (o: QingchunshikeUserItem): boolean => o.id === form.getFieldValue('option'));

    if (item) {
      dispatch(IDBDeleteQingchunshikeUserItem({
        query: item.id
      }));
      form.resetFields(['option']);
    }
  }

  // 渲染用户
  function userListSelectRender(): Array<ReactElement> {
    return userList.map((item: QingchunshikeUserItem): ReactElement => {
      return <Select.Option key={ item.id } value={ item.id }>{ item.description }</Select.Option>;
    });
  }

  // 渲染log
  function logRender(): Array<ReactElement> {
    return log.map((item: string, index: number): ReactElement => {
      return <p key={ index } className={ classNames('my-0 text-[12px]', style.text) }>{ item }</p>;
    });
  }

  useEffect(function(): void {
    dispatch(IDBCursorQingchunshikeUserList({
      query: { indexName: dbConfig.objectStore[8].data[0] }
    }));
  }, []);

  return (
    <Fragment>
      <Card className="mt-[8px]" title="选择配置和时间范围" extra={ <Button type="primary" loading={ loading } onClick={ handleCreateResultClick }>生成结果</Button> }>
        <Alert className="mb-[16px]" type="warning" message={
          <Fragment>
            <div>数据统计可能不准确，仅供参考。开始时间和结束时间请选择青春时刻期间。最长时间不超过6个月。</div>
            <div>直播弹幕的历史由于只能保存5900条数据，如果当天不统计就可能会丢失！请注意！</div>
          </Fragment>
        } />
        <Form form={ form }>
          <Form.Item className={ style.formItem } label="配置">
            <Space>
              <Form.Item name="option" rules={ [{ required: true, message: '请选择配置' }] } noStyle={ true }>
                <Select className={ style.select }>{ userListSelectRender() }</Select>
              </Form.Item>
              <Button className="ml-[8px]" type="primary" danger={ true } onClick={ handleDeleteOptionClick }>删除当前配置</Button>
            </Space>
          </Form.Item>
          <Form.Item className={ style.formItem } label="开始时间" name="startTime" rules={ [{ required: true, message: '请选择开始时间' }] }>
            <DatePicker showTime={ true } />
          </Form.Item>
          <Form.Item className={ style.formItem } label="结束时间" name="endTime" rules={ [{ required: true, message: '请选择结束时间' }] }>
            <DatePicker showTime={ true } />
          </Form.Item>
        </Form>
      </Card>
      <Card className="mt-[8px]" title="日志">{ logRender() }</Card>
      { messageContextHolder }
    </Fragment>
  );
}

export default CreateResult;