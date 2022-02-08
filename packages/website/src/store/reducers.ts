import type { ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import roomInfoQueryApi, { middleware as roomInfoQueryApiMiddleware } from '../pages/RoomInfo/reducers/roomInfo.query';
import recordReducers from '../pages/Record/reducers/record';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  roomInfoQueryApi,
  recordReducers
);

/* apiMiddlewares */
export const apiMiddlewares: Array<Middleware> = [
  roomInfoQueryApiMiddleware
];