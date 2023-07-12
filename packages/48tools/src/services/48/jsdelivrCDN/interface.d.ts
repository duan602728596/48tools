/* ========== jsdelivrCDN ========== */
export interface RoomItem {
  id: number;
  ownerName: string;
  roomId?: string;
  account?: string;
  serverId?: number;
  channelId?: number;
  team?: string;
  teamId?: number;
  groupName?: string;
  periodName?: string;
  pinyin?: string;
  liveRoomId?: string;
}

export interface RoomIdObj {
  roomId: Array<RoomItem>;
  buildTime: string;
}