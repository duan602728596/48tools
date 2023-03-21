import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import type { UserInfo, UserInfoString } from '../types';

export interface Pocket48LoginInitialState {
  userInfo: UserInfo | null;
}

type SliceReducers = {
  setUserInfo: CaseReducer<Pocket48LoginInitialState, PayloadAction<UserInfo>>;
}

const sliceName: 'pocket48Login' = 'pocket48Login';
const { actions, reducer }: Slice<Pocket48LoginInitialState, SliceReducers, typeof sliceName> = createSlice({
  name: sliceName,
  initialState(): Pocket48LoginInitialState {
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

export const { setUserInfo }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export default { [sliceName]: reducer };