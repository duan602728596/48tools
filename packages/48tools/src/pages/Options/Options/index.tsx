import * as path from 'path';
import { promises as fs } from 'fs';
import type { ParsedPath } from 'path';
import { remote, SaveDialogReturnValue, OpenDialogReturnValue } from 'electron';
import * as yaml from 'js-yaml';
import * as fse from 'fs-extra';
import { useEffect, ReactElement, MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createSelector, createStructuredSelector, Selector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Space, Table, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as moment from 'moment';
import type { Moment } from 'moment';
import { random } from 'lodash';
import style from './index.sass';
import { queryOptionsList, deleteOption, saveFormData, OptionsInitialState } from '../reducers/reducers';
import dbConfig from '../../../function/dbInit/dbConfig';
import type { OptionsItem } from '../../../types';

/* state */
interface SelectorRData {
  optionsList: Array<OptionsItem>;
}

const state: Selector<any, SelectorRData> = createStructuredSelector({
  // 配置列表
  optionsList: createSelector(
    ({ options }: { options: OptionsInitialState }): Array<OptionsItem> => options.optionsList,
    (data: Array<OptionsItem>): Array<OptionsItem> => (data)
  )
});

/* 配置列表 */
function Options(props: {}): ReactElement {
  const { optionsList }: SelectorRData = useSelector(state);
  const dispatch: Dispatch = useDispatch();

  // 导入配置
  async function handleImportConfigurationFileClick(event: MouseEvent): Promise<void> {
    const result: OpenDialogReturnValue = await remote.dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;

    const filePath: string = result.filePaths[0];
    const filePathResult: ParsedPath = path.parse(filePath);

    if (!/^\.ya?ml$/i.test(filePathResult.ext)) {
      return message.warn('请导入*.yaml或*.yml格式的文件！');
    }

    // 导入yaml文件
    const fsData: string = await fs.readFile(filePath, { encoding: 'utf8' });
    const yamlParseResult: string | object | undefined = yaml.safeLoad(fsData);

    if (typeof yamlParseResult !== 'object') {
      return message.error('配置文件解析失败！');
    }

    const option: Array<OptionsItem> = yamlParseResult['qqtools']['option'];
    const time: string = yamlParseResult['qqtools']['time'] ?? moment().format('YYYY-MM-DD HH:mm:ss');

    // 重写id和name，避免重复
    option.forEach(function(value: OptionsItem, index: number): void {
      value.id = `${ value.id }_${ String(random(1, 10000000)) }`;
      value.name = `${ value.name }_${ time }`;
    });

    await dispatch(saveFormData({
      data: option
    }));
    message.success('配置文件导入成功！');

    // 改变ui
    dispatch(queryOptionsList({
      query: { indexName: dbConfig.objectStore[0].data[0] }
    }));
  }

  // 导出配置
  async function handleExportConfigurationFileClick(event: MouseEvent): Promise<void> {
    const time: Moment = moment();
    const result: SaveDialogReturnValue = await remote.dialog.showSaveDialog({
      defaultPath: `配置备份_${ time.format('YYYY.MM.DD.HH.mm.ss') }_.yaml`
    });

    if (result.canceled || !result.filePath) return;

    // 导出为yaml
    const time1: string = time.format('YYYY-MM-DD HH:mm:ss');
    let ymlResult: string = yaml.safeDump({
      qqtools: {
        option: optionsList
      }
    });

    ymlResult = `# qqtools配置文件导出\n# ${ time1 }\n\n${ ymlResult }`;

    await fse.outputFile(result.filePath, ymlResult);
    message.success('配置文件导出成功！');
  }

  // 删除
  function handleDeleteClick(record: OptionsItem, event?: MouseEvent): void {
    dispatch(deleteOption({
      query: record.id
    }));
  }

  const columns: ColumnsType<OptionsItem> = [
    { title: '配置名称', dataIndex: 'name' },
    { title: 'QQ号', dataIndex: ['value', 'qqNumber'] },
    { title: '群号', dataIndex: ['value', 'groupNumber'] },
    {
      title: '操作',
      key: 'handle',
      width: 140,
      render: (value: undefined, record: OptionsItem, index: number): ReactElement => {
        return (
          <Button.Group>
            <Link to={ `Edit/${ record.id }` }>
              <Button>修改</Button>
            </Link>
            <Popconfirm title="确定要删除吗？" onConfirm={ (event?: MouseEvent): void => handleDeleteClick(record, event) }>
              <Button type="primary" danger={ true }>删除</Button>
            </Popconfirm>
          </Button.Group>
        );
      }
    }
  ];

  useEffect(function(): void {
    dispatch(queryOptionsList({
      query: { indexName: dbConfig.objectStore[0].data[0] }
    }));
  }, []);

  return (
    <div className={ style.content }>
      <div className={ style.toolsGroup }>
        <Space className={ style.toolsItem }>
          <Link to="Edit">
            <Button type="primary">添加配置</Button>
          </Link>
          <Link to="../">
            <Button type="primary" danger={ true }>返回</Button>
          </Link>
        </Space>
        <Space>
          <Button onClick={ handleImportConfigurationFileClick }>导入配置</Button>
          <Button onClick={ handleExportConfigurationFileClick }>导出配置</Button>
        </Space>
      </div>
      <Table columns={ columns } dataSource={ optionsList } rowKey="id" />
    </div>
  );
}

export default Options;