/**
 * antd中useModal和useMessage的返回值
 */

import type { ReactElement, JSXElementConstructor } from 'react';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { MessageInstance } from 'antd/es/message/interface';

export type UseModalReturnType = readonly [Omit<ModalStaticFunctions, 'warn'>, ReactElement];
export type UseMessageReturnType = readonly [MessageInstance, ReactElement<any, string | JSXElementConstructor<any>>];


/* select */
export interface LabeledValue {
  label: string;
  value: string | number;
}