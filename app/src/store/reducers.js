/* reducers */
import liveCache from '../modules/LiveCache/store/reducer';
import playBackDownload from '../modules/PlayBackDownload/store/reducer';

const reducers = {
  ...liveCache,
  ...playBackDownload
};

export default reducers;
