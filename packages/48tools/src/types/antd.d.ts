/**
 * antd中useModal和useMessage的返回值
 */

import type { ReactElement, JSXElementConstructor } from 'react';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

type ContextHolderType = ReactElement<any, string | JSXElementConstructor<any>>;

export type UseModalReturnType = readonly [Omit<ModalStaticFunctions, 'warn'>, ContextHolderType];
export type UseMessageReturnType = readonly [MessageInstance, ContextHolderType];
export type UseNotificationType = readonly [NotificationInstance, ContextHolderType];

/* select */
export interface LabeledValue {
  label: string;
  value: string | number;
}