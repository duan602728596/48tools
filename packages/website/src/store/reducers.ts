import type { ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import roomInfoQueryApi, { middleware as roomInfoQueryApiMiddleware } from '../pages/RoomInfo/reducers/roomInfo.query';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  roomInfoQueryApi
);

/* apiMiddlewares */
export const middlewares: Array<Middleware> = [
  roomInfoQueryApiMiddleware
];