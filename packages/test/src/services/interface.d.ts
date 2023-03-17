/* 获取B站直播的列表 */
export interface BilibiliLiveRoomList {
  module_info: object;
  list: Array<{
    roomid: number;
    uid: number;
    title: string;
    uname: string;
  }>;
}

export interface BilibiliLiveListResponse {
  code: number;
  data: {
    room_list: Array<BilibiliLiveRoomList>;
  };
}

/* 获取A站直播的列表 */
export interface AcfunLiveList {
  createTime: number;
  groupId: string;
  href: string;
  liveId: string;
  title: string;
}

export interface AcfunLiveListResponse {
  channelListData: {
    liveList: Array<AcfunLiveList>;
  };
  totalCount: number;
}