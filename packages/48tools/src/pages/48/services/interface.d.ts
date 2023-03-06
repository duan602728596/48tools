/* ========== pocket48 ========== */
interface Pocket48ResponseBase {
  message: string;
  status: number;
  success: boolean;
}

// 当前的用户信息
export interface UserInfo {
  avatar: string;
  nickname: string;
  teamLogo: string;
  userId: string;
}

// 直播信息
export interface LiveInfo {
  coverPath: string;
  ctime: string;
  liveId: string;
  roomId: string;
  liveType: 1 | 2; // 1：直播，2：电台
  liveMode: 0 | 1; // 0：正常，1：录屏
  title: string;
  userInfo: UserInfo;
  inMicrophoneConnection: boolean;
}

// 返回的直播数据
export interface LiveData extends Pocket48ResponseBase {
  content: {
    liveList: Array<LiveInfo>;
    next: string;
    slideUpAndDown: boolean;
  };
}

// 直播间信息
export interface LiveRoomInfo extends Pocket48ResponseBase {
  content: {
    carousels?: {
      carouselTime: number;
      carousels: Array<string>;
    };
    liveId: string;
    roomId: string;
    playStreamPath: string;
    systemMsg: string;
    msgFilePath: string;
    user: {
      userAvatar: string;
      userId: string;
      userName: string;
    };
    title: string;
    ctime: string;
  };
}

// 搜索
export interface SearchMemberIndex {
  memberId: number;
  nickname: string;
  avatar: string;
  suggest: Array<unknown>;
}

export interface SearchResult extends Pocket48ResponseBase {
  content: {
    pagePra: string;
    memberIndexTemplates: null | Array<SearchMemberIndex>;
  };
}

// server search
export interface ServerApiItem {
  showButton: boolean;
  teamId: number;
  serverOwner: number;
  serverId: number;
  serverName: string;
  serverIcon: string;
  serverDefaultName: string;
  serverDefaultIcon: string;
  serverType: number;
  followStatus: number;
}

export interface ServerSearchResult extends Pocket48ResponseBase {
  content: {
    serverApiList: Array<ServerApiItem>;
  };
}

export interface ServerJumpResult extends Pocket48ResponseBase {
  content: {
    serverId: number;
    channelId: number;
  };
}

/* ========== 口袋48房间消息 ========== */
export type MsgType = 'TEXT'
  | 'IMAGE'
  | 'REPLY'
  | 'GIFTREPLY'
  | 'AUDIO'
  | 'VIDEO'
  | 'LIVEPUSH'
  | 'FLIPCARD'
  | 'EXPRESS'
  | 'DELETE'
  | 'DISABLE_SPEAK'
  | 'SESSION_DIANTAI'
  | 'FLIPCARD_AUDIO'
  | 'FLIPCARD_VIDEO'
  | 'EXPRESSIMAGE'
  | 'OPEN_LIVE'
  | 'TRIP_INFO'
  | 'PRESENT_NORMAL'
  | 'PRESENT_TEXT'
  | 'VOTE'
  | 'CLOSE_ROOM_CHAT'
  | 'ZHONGQIU_ACTIVITY_LANTERN_FANS';

// roleId = 3为xox
export interface CustomMessageV2 {
  msgIdServer: number;
  msgIdClient: string;
  bodys: string;
  extInfo: string;
  msgType: MsgType;
  msgTime: number; // 最上是最新的
}

export interface HomeMessageResult extends Pocket48ResponseBase {
  content: {
    message: Array<CustomMessageV2>;
    nextTime: number;
  };
}

/* ========== live48 ========== */
interface LiveOnePlayStreams {
  streamName: '标清' | '高清' | '超清';
  streamPath?: string;
  streamType: 1 | 2 | 3;
  vipShow: boolean;
  logonPicture?: string;
}

export interface LiveOne {
  content: {
    liveId: string;
    title: string;
    coverPath: string;
    roomId: string;
    status: number;
    playNum: string;
    stime: string;
    hasPraise: boolean;
    praiseNum: string;
    dengPaiGiftId: string;
    danMuInfo: {
      giftId: string;
      money: string;
    };
    type: number;
    liveJoiners: Array<unknown>;
    playStreams: Array<LiveOnePlayStreams>;
    module: {
      resourceId: string;
      resourceType: number;
      resourceMd: string;
    };
    mute: boolean;
    liveType: 0;
    isCollection: number;
    crm: string;
    subTitle: string;
    endTime: string;
  };
  message: string;
  status: number;
  success: boolean;
}