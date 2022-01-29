import { createApi } from '@reduxjs/toolkit/query/react';
import type { Middleware } from '@reduxjs/toolkit';
import type { QueryApi, QueryEndpointBuilder, EndpointsReturn } from '../../../store/queryTypes';
import GraphQLRequest, { isGraphQLData, type GraphQLResponse } from '../../../utils/GraphQLRequest';
import type { RoomInfo, RoomId } from '../../../../api/services/interface';

const TAG_TYPES: Record<string, string> = {
  ROOM_INFO_LIST: 'roomInfoQueryApi/roomInfoList'
};

const api: QueryApi = createApi({
  reducerPath: 'roomInfoQueryApi',
  keepUnusedDataFor: 600_000,
  tagTypes: Object.values(TAG_TYPES),
  endpoints(builder: QueryEndpointBuilder): EndpointsReturn {
    return {
      reqRoomIdList: builder.query({
        async queryFn(): Promise<{ data: Array<RoomId> }> {
          type ResData = { roomInfo: RoomInfo };
          const res: GraphQLResponse<ResData> = await GraphQLRequest<ResData>(/* GraphQL */ `
            {
                roomInfo {
                    roomId {
                        id
                        ownerName
                        roomId
                        account
                    }
                }
            }
          `);

          if (isGraphQLData<ResData>(res)) {
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