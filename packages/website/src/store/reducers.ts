import type { ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import roomInfoQueryApi from '../pages/RoomInfo/reducers/roomInfo.query';
import recordReducers from '../pages/Record/reducers/record';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  { [roomInfoQueryApi.reducerPath]: roomInfoQueryApi.reducer },
  recordReducers
);

/* apiMiddlewares */
export const apiMiddlewares: Array<Middleware> = [
  roomInfoQueryApi.middleware
];