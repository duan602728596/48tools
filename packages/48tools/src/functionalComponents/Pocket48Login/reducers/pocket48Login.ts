import { createSlice, type Slice, type PayloadAction, type CaseReducer, type CaseReducerActions } from '@reduxjs/toolkit';
import { Pocket48Login } from '../enum';
import type { UserInfo, UserInfoString } from '../types';

export interface Pocket48LoginInitialState {
  userInfo: UserInfo | null;
}

type SliceReducers = {
  setUserInfo: CaseReducer<Pocket48LoginInitialState, PayloadAction<UserInfo>>;
  setClearInfo: CaseReducer<Pocket48LoginInitialState, PayloadAction>;
}

type SliceSelectors = {
  userInfo: (state: Pocket48LoginInitialState) => UserInfo | null;
};

const sliceName: 'pocket48Login' = 'pocket48Login';
const { actions, reducer, selectors: selectorsObject }: Slice<
  Pocket48LoginInitialState,
  SliceReducers,
  typeof sliceName,
  typeof sliceName,
  SliceSelectors
> = createSlice({
  name: sliceName,
  initialState(): Pocket48LoginInitialState {
    const userInfoStr: string | null = localStorage.getItem(Pocket48Login.StorageKey);

    return { userInfo: userInfoStr !== null ? JSON.parse(userInfoStr as UserInfoString) : null };
  },
  reducers: {
    setUserInfo(state: Pocket48LoginInitialState, action: PayloadAction<UserInfo>): void {
      localStorage.setItem(Pocket48Login.StorageKey, JSON.stringify(action.payload));
      state.userInfo = action.payload;
    },

    setClearInfo(state: Pocket48LoginInitialState, action: PayloadAction): void {
      localStorage.removeItem(Pocket48Login.StorageKey);
      state.userInfo = null;
    }
  },
  selectors: {
    userInfo: (state: Pocket48LoginInitialState): UserInfo | null => state.userInfo
  }
});

export const { setUserInfo, setClearInfo }: CaseReducerActions<SliceReducers, typeof sliceName> = actions;
export { selectorsObject };
export default { [sliceName]: reducer };