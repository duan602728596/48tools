import { createApi, type Api, type QueryDefinition, type ApiModules } from '@reduxjs/toolkit/query/react';
import type { EndpointBuilder } from '@reduxjs/toolkit/src/query/endpointDefinitions';
import type { UseQueryHookResult } from '@reduxjs/toolkit/src/query/react/buildHooks';
import { requestRoomId, type RoomIdObj, type RoomItem } from '@48tools-api/48/jsdelivrCDN';

/* redux */
const apiReducerPathName: 'pocketFriendsApi' = 'pocketFriendsApi';
const TAG_TYPES: Record<string, string> = {
  ROOMID: `${ apiReducerPathName }/roomId`
};

type BaseQueryReturn = { data: undefined };
type BaseQuery = () => BaseQueryReturn;
type EndpointDefinitions = {
  reqRoomId: QueryDefinition<undefined, BaseQuery, string, Array<RoomItem>, typeof apiReducerPathName>;
};
type PocketFriendsApi = Api<
  BaseQuery,
  EndpointDefinitions,
  typeof apiReducerPathName,
  string,
  keyof ApiModules<BaseQuery, EndpointDefinitions, typeof apiReducerPathName, string>
>;

const pocketFriendsApi: PocketFriendsApi = createApi({
  reducerPath: apiReducerPathName,
  baseQuery(): BaseQueryReturn {
    return { data: undefined };
  },
  keepUnusedDataFor: 10 * 60_000,
  tagTypes: Object.values(TAG_TYPES),
  endpoints(builder: EndpointBuilder<BaseQuery, string, typeof apiReducerPathName>): EndpointDefinitions {
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
}) as PocketFriendsApi;

export type ReqRoomId = UseQueryHookResult<EndpointDefinitions['reqRoomId']>;
export const { useReqRoomIdQuery }: PocketFriendsApi = pocketFriendsApi;

export default pocketFriendsApi;