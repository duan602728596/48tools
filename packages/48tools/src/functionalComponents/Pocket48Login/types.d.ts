export interface UserInfo {
  token: string;
  nickname: string;
  avatar: string;
}

export type UserInfoString = `{
  "token": "${ string }",
  "nickname": "${ string }",
  "avatar": "${ string }"
}`;