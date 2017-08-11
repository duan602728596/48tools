/* reducers */
import liveCache from '../modules/LiveCatch/store/reducer';
import playBackDownload from '../modules/PlayBackDownload/store/reducer';
import bilibili from '../modules/Bilibili/store/reducer';

const reducers = {
  ...liveCache,
  ...playBackDownload,
  ...bilibili
};

export default reducers;
