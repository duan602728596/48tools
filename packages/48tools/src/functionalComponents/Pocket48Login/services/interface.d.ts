export interface SMSResult {
  status: number;
  success: boolean;
  message: string;
  content: null;
}

/* 登录结果 */
export interface LoginUserInfo {
  content: {
    userInfo: {
      token: string;
      nickname: string;
      avatar: string;
    };
    token: string;
  };
  status: number;
  success: boolean;
  message: string;
}

/* IM */
export interface IMUserInfo {
  status: 200 | number;
  success: boolean;
  content: {
    userId: number;
    accid: string;
    pwd: string;
  };
}