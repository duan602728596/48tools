import type { ReactElement, MouseEvent as ReactMouseEvent } from 'react';
import { Modal, Input, Form, Select, type FormInstance } from 'antd';
import type { ModalProps } from 'antd/es/modal';
import type { BaseOptionType } from 'rc-select/es/Select';
import style from './editModal.sass';
import { templateSelectOptions, template, type TplItem } from './template';

interface EditModalProps {
  open: boolean;
  onOk(value: { args: string }): void;
}

type EditModalUseProps = Pick<ModalProps, 'onCancel'>;

/* 添加和编辑ffmpeg命令 */
function EditModal(props: EditModalProps & EditModalUseProps): ReactElement {
  const { open, onOk, onCancel }: EditModalProps & EditModalUseProps = props;
  const [form]: [FormInstance] = Form.useForm();

  // 选中后修改模板
  function handleTemplateSelect(value: string, option: { item: TplItem } & BaseOptionType): void {
    form.setFieldsValue({
      args: option.item.value
    });
  }

  // 确认
  function handleOkClick(event: ReactMouseEvent<HTMLButtonElement, MouseEvent>): void {
    onOk(form.getFieldsValue());
  }

  return (
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
      <Form className="h-[250px] overflow-auto" form={ form } initialValues={{ args: template[0].value }}>
        <Form.Item label="ffmpeg" colon={ false }>
          <Form.Item name="args" noStyle={ true }>
            <Input.TextArea rows={ 7 } />
          </Form.Item>
        </Form.Item>
        <Form.Item name="template" label="选择命令模板">
          <Select className={ style.templateSelect } onSelect={ handleTemplateSelect }>
            { templateSelectOptions }
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditModal;