import { createSlice, type Slice, type SliceCaseReducers, type PayloadAction } from '@reduxjs/toolkit';
import type { UserInfo, UserInfoString } from '../types';

export interface Pocket48LoginInitialState {
  userInfo: UserInfo | null;
}

type CaseReducers = SliceCaseReducers<Pocket48LoginInitialState>;

const { actions, reducer }: Slice = createSlice<Pocket48LoginInitialState, CaseReducers, 'pocket48Login'>({
  name: 'pocket48Login',
  initialState: (): Pocket48LoginInitialState => {
    const userInfoStr: string | null = sessionStorage.getItem('POCKET48_USER_INFO');

    return { userInfo: userInfoStr !== null ? JSON.parse(userInfoStr as UserInfoString) : null };
  },
  reducers: {
    setUserInfo(state: Pocket48LoginInitialState, action: PayloadAction<UserInfo>): void {
      sessionStorage.setItem('POCKET48_USER_INFO', JSON.stringify(action.payload));
      state.userInfo = action.payload;
    }
  }
});

export const { setUserInfo }: Record<string, Function> = actions;
export default { pocket48Login: reducer };