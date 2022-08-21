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