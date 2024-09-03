import { randomUUID } from 'node:crypto';
import { Fragment, useEffect, type ReactElement, type MouseEvent as ReactMouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Modal, Input, Form, Select, Space, Button, message, type FormInstance } from 'antd';
import type { ModalProps } from 'antd/es/modal';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { DeleteFilled as IconDeleteFilled } from '@ant-design/icons';
import * as classNames from 'classnames';
import style from './editModal.sass';
import dbConfig from '../../../../utils/IDB/IDBConfig';
import { IDBCursorTemplateList, IDBSaveTemplateList, IDBDeleteTemplateList, type FFmpegProcessInitialState } from '../../reducers/FFmpegProcess';
import { templateSelectOptions, template, type TplItem, type TplOption } from './template';
import type { dbTemplateItem } from '../../types';

/* redux selector */
type RSelector = { dbTemplateList: Array<dbTemplateItem> };
type RState = { FFmpegProcess: FFmpegProcessInitialState };

const selector: Selector<RState, RSelector> = createStructuredSelector({
  // 查询template
  dbTemplateList: ({ FFmpegProcess: FP }: RState): Array<dbTemplateItem> => FP.dbTemplateList ?? []
});

interface EditModalProps {
  open: boolean;
  onOk(value: { args: string }): void;
}

type EditModalUseProps = Pick<ModalProps, 'onCancel'>;

/* 添加和编辑ffmpeg命令 */
function EditModal(props: EditModalProps & EditModalUseProps): ReactElement {
  const { open, onOk, onCancel }: EditModalProps & EditModalUseProps = props;
  const { dbTemplateList }: RSelector = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [form]: [FormInstance] = Form.useForm();

  // 删除template
  function handleDeleteTemplateClick(o: dbTemplateItem, event: ReactMouseEvent): void {
    event.stopPropagation();

    dispatch(IDBDeleteTemplateList({
      query: o.id
    }));
  }

  // 保存template
  function handleSaveTemplateClick(event: ReactMouseEvent): void {
    const value: { args: string; template: string; name: string } = form.getFieldsValue();

    if (value.name && value.args && !/^\s*$/.test(value.args) && !/^\s*$/.test(value.name)) {
      dispatch(IDBSaveTemplateList({
        data: {
          id: randomUUID(),
          name: value.name,
          args: value.args
        }
      }));
      messageApi.success('保存成功！');
    }
  }

  // 选中后修改模板
  function handleTemplateSelect(value: string, option: { item: TplItem } & DefaultOptionType): void {
    form.setFieldsValue({
      args: option.item.value
    });
  }

  // 确认
  function handleOkClick(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void {
    onOk(form.getFieldsValue());
  }

  // 渲染selectOptions
  function dbTemplateSelectOptionsRender(): Array<TplOption> {
    return dbTemplateList.map((o: dbTemplateItem): TplOption => {
      return {
        label: (
          <Fragment>
            { o.name }
            <IconDeleteFilled className={ classNames('cursor-pointer float-right', style.deleteIcon) }
              tabIndex={ 0 }
              role="button"
              aria-label="删除"
              onClick={ (event: ReactMouseEvent): void => handleDeleteTemplateClick(o, event) }
            />
          </Fragment>
        ),
        value: o.id,
        item: { id: o.id, label: o.name, value: o.args }
      };
    });
  }

  useEffect(function(): void {
    dispatch(IDBCursorTemplateList({
      query: { indexName: dbConfig.objectStore[4].data[1] }
    }));
  }, []);

  return (
    <Fragment>
      <Modal open={ open }
        width={ 600 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        okText="执行"
        cancelText="关闭"
        onOk={ handleOkClick }
        onCancel={ onCancel }
      >
        <Form className="h-[300px] overflow-auto" form={ form } initialValues={{
          args: template[0].value,
          template: template[0].id
        }}>
          <Form.Item label="ffmpeg" colon={ false }>
            <Form.Item name="args" noStyle={ true }>
              <Input.TextArea rows={ 7 } />
            </Form.Item>
          </Form.Item>
          <Form.Item name="template" label="选择命令模板">
            <Select className={ style.templateSelect }
              options={ templateSelectOptions.concat(dbTemplateSelectOptionsRender()) }
              onSelect={ handleTemplateSelect }
            />
          </Form.Item>
          <Form.Item label="将当前命令保存到本地">
            <Space size={ 6 }>
              <Form.Item name="name" noStyle={ true }>
                <Input placeholder="输入当前命令的介绍" />
              </Form.Item>
              <Button onClick={ handleSaveTemplateClick }>保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default EditModal;