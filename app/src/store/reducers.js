// @flow
/* reducers */
import index from '../modules/Index/store/reducer';
import liveCache from '../modules/LiveCatch/store/reducer';
import playBackDownload from '../modules/PlayBackDownload/store/reducer';
import bilibili from '../modules/Bilibili/store/reducer';
import cut from '../modules/Cut/store/render';

const reducers: Object = {
  ...index,
  ...liveCache,
  ...playBackDownload,
  ...bilibili,
  ...cut
};

export default reducers;
