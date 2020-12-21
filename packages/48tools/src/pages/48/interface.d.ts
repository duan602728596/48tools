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
  liveType: 1 | 2; // 1：直播，2：电台
  title: string;
  userInfo: UserInfo;
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
  };
  message: string;
  status: number;
  success: boolean;
}