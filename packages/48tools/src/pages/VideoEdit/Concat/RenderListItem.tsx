import type { ReactElement, CSSProperties, MouseEvent } from 'react';
import { Button, List } from 'antd';
import { MenuOutlined as IconMenuOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import type { UseSortableReturn } from '@48tools-types/dnd-kit';
import style from './renderListItem.sass';
import type { ConcatItem } from '../types';

interface RenderListItemProps {
  item: ConcatItem;
  index: number;
  onDeleteItem(item: ConcatItem, event: MouseEvent): void;
}

/* 可拖拽的ListItem */
function RenderListItem(props: RenderListItemProps): ReactElement {
  const { item, index, onDeleteItem }: RenderListItemProps = props;
  const {
    active,
    over,
    attributes,
    listeners,
    transform,
    setDroppableNodeRef,
    setDraggableNodeRef
  }: UseSortableReturn = useSortable({
    id: item.id,
    data: { item, index }
  });
  const dndStyle: CSSProperties = { transform: CSS.Translate.toString(transform) };
  const isActive: boolean = active?.id === item.id; // 是否被拖拽
  const isOver: boolean = over?.id === item.id && over?.id !== active?.id; // 是否是与被拖拽对象重叠

  return (
    <List.Item key={ item.id }
      ref={ setDroppableNodeRef }
      className={ classNames(style.helperItem, { [style.over]: isOver, [style.active]: isActive }) }
      style={ isActive ? dndStyle : undefined }
      actions={ [
        <Button key="delete"
          size="small"
          type="primary"
          danger={ true }
          onClick={ (event: MouseEvent): void => onDeleteItem(item, event) }
        >
          删除
        </Button>
      ] }
      { ...attributes }
    >
      <div className="flex">
        <div className="shrink-0">
          <IconMenuOutlined ref={ setDraggableNodeRef } className="mr-[12px] !cursor-move" { ...listeners } />
        </div>
        <div className="grow break-all">{ index + 1 }、{ item.filename }</div>
      </div>
    </List.Item>
  );
}

export default RenderListItem;