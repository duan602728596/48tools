import { createApi } from '@reduxjs/toolkit/query/react';
import type { Middleware } from '@reduxjs/toolkit';
import type { QueryApi, QueryEndpointBuilder, QueryEndpointFuncReturn } from '../../../store/queryTypes';
import GraphQLRequest, { isGraphQLData, type GraphQLResponse } from '../../../utils/GraphQLRequest';
import type { RoomInfo, RoomId } from '../../../../src-api/services/interface';

interface RoomInfoResponseData {
  roomInfo: RoomInfo;
}

const TAG_TYPES: Record<string, string> = {
  ROOM_INFO_LIST: 'roomInfoQueryApi/roomInfoList'
};

const api: QueryApi = createApi({
  reducerPath: 'roomInfoQueryApi',
  keepUnusedDataFor: 600_000,
  tagTypes: Object.values(TAG_TYPES),
  endpoints(builder: QueryEndpointBuilder): QueryEndpointFuncReturn {
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
} as any);

export const { useReqRoomIdListQuery }: any = api;
export const middleware: Middleware = api.middleware;
export default { [api.reducerPath]: api.reducer };