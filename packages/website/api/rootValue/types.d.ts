import type { LiveInfo, LiveRoomInfoContent, RoomInfo } from '../services/interface';

/* record */
export interface RecordValueLiveInfo extends LiveInfo {
  liveRoomInfo(): Promise<LiveRoomInfoContent>;
}

export interface RecordValue {
  next: string;
  liveList: Array<RecordValueLiveInfo>;
}

export interface RecordContext {
  next?: string;
  userId?: number;
}

export interface RootValue {
  record(context: RecordContext): Promise<RecordValue>;
  roomInfo(): Promise<RoomInfo>;
}