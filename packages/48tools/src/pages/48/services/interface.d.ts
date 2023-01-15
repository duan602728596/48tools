/* ========== pocket48 ========== */
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
  title: string;
  userInfo: UserInfo;
  inMicrophoneConnection: boolean;
}

// 返回的直播数据
export interface LiveData {
  content: {
    liveList: Array<LiveInfo>;
    next: string;
    slideUpAndDown: boolean;
  };
  message: string;
  status: number;
  success: boolean;
}

// 直播间信息
export interface LiveRoomInfo {
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
  message: string;
  status: number;
  success: boolean;
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