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