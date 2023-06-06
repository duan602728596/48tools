import { createApi, type Api, type QueryDefinition, type ApiModules } from '@reduxjs/toolkit/query/react';
import type { EndpointBuilder } from '@reduxjs/toolkit/src/query/endpointDefinitions';
import type { UseQueryHookResult } from '@reduxjs/toolkit/src/query/react/buildHooks';
import GraphQLRequest, { isGraphQLData, type GraphQLResponse } from '../../../utils/GraphQLRequest';
import type { RoomInfo, RoomId } from '../../../../src-api/services/interface';

interface RoomInfoResponseData {
  roomInfo: RoomInfo;
}

const apiReducerPathName: 'roomInfoQueryApi' = 'roomInfoQueryApi';
const TAG_TYPES: Record<string, string> = {
  ROOM_INFO_LIST: `${ apiReducerPathName }/roomInfoList`
};

type BaseQueryReturn = { data: undefined };
type BaseQuery = () => BaseQueryReturn;
type EndpointDefinitions = {
  reqRoomIdList: QueryDefinition<void, BaseQuery, string, Array<RoomId>, typeof apiReducerPathName>;
};
type RoomInfoQueryApi = Api<
  BaseQuery,
  EndpointDefinitions,
  typeof apiReducerPathName,
  string,
  keyof ApiModules<BaseQuery, EndpointDefinitions, typeof apiReducerPathName, string>
>;

// @ts-ignore
const api: RoomInfoQueryApi = createApi({
  reducerPath: apiReducerPathName,
  baseQuery(): BaseQueryReturn {
    return { data: undefined };
  },
  keepUnusedDataFor: 10 * 60_000,
  tagTypes: Object.values(TAG_TYPES),
  endpoints(builder: EndpointBuilder<BaseQuery, string, typeof apiReducerPathName>): EndpointDefinitions {
    return {
      reqRoomIdList: builder.query({
        async queryFn(): Promise<{ data: Array<RoomId> }> {
          const res: GraphQLResponse<RoomInfoResponseData> = await GraphQLRequest<RoomInfoResponseData>(/* GraphQL */ `
            {
                roomInfo {
                    roomId {
                        id
                        ownerName
                        serverId
                    }
                }
            }
          `);

          if (isGraphQLData<RoomInfoResponseData>(res)) {
            return { data: res.data.roomInfo.roomId };
          } else {
            return { data: [] };
          }
        },
        providesTags: [TAG_TYPES.ROOM_INFO_LIST]
      })
    };
  }
});

export type ReqRoomList = UseQueryHookResult<EndpointDefinitions['reqRoomIdList']>;
export const { useReqRoomIdListQuery }: RoomInfoQueryApi = api;

export default api;