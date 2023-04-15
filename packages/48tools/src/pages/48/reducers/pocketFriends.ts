/* eslint-disable @typescript-eslint/typedef */
import { createApi } from '@reduxjs/toolkit/query/react';
import type { ApiUseQueryCore } from '@48tools-types/redux-toolkit';
import { requestRoomId } from '../services/jsdelivrCDN';
import type { RoomIdObj, RoomItem } from '../services/interface';

const apiReducerPathName: 'pocketFriendsApi' = 'pocketFriendsApi';
const TAG_TYPES: Record<string, string> = {
  ROOMID: `${ apiReducerPathName }/roomId`
};

const pocketFriendsApi = createApi({
  reducerPath: apiReducerPathName,
  baseQuery() {
    return { data: undefined };
  },
  keepUnusedDataFor: 10 * 60_000,
  tagTypes: Object.values(TAG_TYPES),
  endpoints(builder) {
    return {
      reqRoomId: builder.query({
        async queryFn(): Promise<{ data: Array<RoomItem> }> {
          const res: RoomIdObj = await requestRoomId();

          return { data: res.roomId };
        },
        providesTags: [TAG_TYPES.ROOMID]
      })
    };
  }
});

export type ReqRoomId = ApiUseQueryCore<Array<RoomItem>>;
export const { useReqRoomIdQuery } = pocketFriendsApi;

export default pocketFriendsApi;