export interface UserInfo {
  token: string;
  nickname: string;
  avatar: string;
  unknown?: boolean;
}

export type UserInfoString = `{
  "token": "${ string }",
  "nickname": "${ string }",
  "avatar": "${ string }"
}`;