import type { LiveInfo, LiveRoomInfoContent, RoomInfo } from '../services/interface';

/* record */
export interface RecordValueLiveInfo extends LiveInfo {
  liveRoomInfo(): Promise<LiveRoomInfoContent>;
}

export interface RecordValue {
  next: string;
  liveList: Array<RecordValueLiveInfo>;
  liveRoomInfo: Promise<Array<LiveRoomInfoContent>>;
}

export interface RecordContext {
  userId: number;
  next?: string;
  liveId?: Array<string>;
}

/* root */
export interface RootValue {
  record(context: RecordContext): Promise<RecordValue>;
  roomInfo(): Promise<RoomInfo>;
}