import * as Store from 'electron-store';

const store: Store<any> = new Store({
  schema: {
    theme: {
      type: 'string',
      enum: ['system', 'light', 'dark']
    }
  }
});

export default store;