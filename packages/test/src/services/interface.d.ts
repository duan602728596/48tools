/* 获取B站直播的列表 */
export interface RoomList {
  module_info: object;
  list: Array<{
    roomid: number;
    uid: number;
    title: string;
    uname: string;
  }>;
}

export interface LiveListResponse {
  code: number;
  data: {
    room_list: Array<RoomList>;
  };
}