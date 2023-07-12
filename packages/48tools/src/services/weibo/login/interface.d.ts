export interface UserInfo {
  ok: number;
  data: {
    user: {
      id: number;
      idstr: string;
      screen_name: string;
      location: string;
      description: string;
    };
  };
}