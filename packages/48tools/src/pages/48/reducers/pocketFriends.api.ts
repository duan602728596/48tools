import { createApi, type Api, type QueryDefinition, type ApiModules } from '@reduxjs/toolkit/query/react';
import type { EndpointBuilder } from '@reduxjs/toolkit/src/query/endpointDefinitions';
import type { UseQueryHookResult } from '@reduxjs/toolkit/src/query/react/buildHooks';
import { requestRoomId } from '../services/jsdelivrCDN';
import type { RoomIdObj, RoomItem } from '../services/interface';

/* 格式化数据 */
const order: Array<string> = [
  'TEAM SII',
  'TEAM NII',
  'TEAM HII',
  'TEAM X',
  'BEJ48',
  'TEAM G',
  'TEAM NIII',
  'TEAM Z',
  'CKG48',
  'TEAM CII',
  'TEAM GII',
  '预备生',
  'IDFT',
  '荣誉毕业生',
  '',
  '丝芭影视'
];

export interface RoomIdFormatItem {
  title: string;
  data: Array<RoomItem>;
}

function groupToMap(array: Array<RoomItem> = []): Array<RoomIdFormatItem> {
  const obj: Record<string, Array<RoomItem>> = {};
  const result: Array<RoomIdFormatItem> = [];

  for (const item of array) {
    const title: string = item.team ?? '';

    obj[title] ??= [];
    obj[title].push(item);
  }

  for (const key in obj) {
    result.push({
      title: key,
      data: obj[key]
    });
  }

  return result.sort((a: RoomIdFormatItem, b: RoomIdFormatItem): number => {
    const aIndex: number = order.indexOf(a.title);
    const bIndex: number = order.indexOf(b.title);

    return (aIndex < 0 ? 9999 : aIndex) - (bIndex < 0 ? 9999 : bIndex);
  });
}

/* redux */
const apiReducerPathName: 'pocketFriendsApi' = 'pocketFriendsApi';
const TAG_TYPES: Record<string, string> = {
  ROOMID: `${ apiReducerPathName }/roomId`
};

type BaseQueryReturn = { data: undefined };
type BaseQuery = () => BaseQueryReturn;
type EndpointDefinitions = {
  reqRoomId: QueryDefinition<undefined, BaseQuery, string, Array<RoomIdFormatItem>, typeof apiReducerPathName>;
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
        async queryFn(): Promise<{ data: Array<RoomIdFormatItem> }> {
          const res: RoomIdObj = await requestRoomId();

          return { data: groupToMap(res.roomId) };
        },
        providesTags: [TAG_TYPES.ROOMID]
      })
    };
  }
}) as PocketFriendsApi;

export type ReqRoomId = UseQueryHookResult<EndpointDefinitions['reqRoomId']>;
export const { useReqRoomIdQuery }: PocketFriendsApi = pocketFriendsApi;

export default pocketFriendsApi;