import type { ReactElement } from 'react';
import commonStyle from '../../common.sass';
import ProgressSet from './ProgressSet';

interface ProgressNativeProps {
  readonly progressSet: ProgressSet;
}

/**
 * 进度条
 * @param { ProgressSet } props.progressSet - 进度条设置
 */
function ProgressNative(props: ProgressNativeProps): ReactElement {
  const { progressSet }: ProgressNativeProps = props;

  return (
    <span className={ commonStyle.tips }
      id={ progressSet.progressId }
      aria-label="progress"
      aria-valuemin={ 0 }
      aria-valuemax={ 100 }
      aria-valuenow={ progressSet.value }
      aria-valuetext={ `${ progressSet.value }%` }
    >
      { progressSet.value }%
    </span>
  );
}

export default ProgressNative;