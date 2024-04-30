import { useState, useMemo, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
import { Transfer } from 'antd';
import type { VideoInfoWithKey } from '../types';

interface VideoListSelectProps {
  id?: string;
  value?: Array<VideoInfoWithKey>;
  onChange?: Function;
  dataSource: Array<VideoInfoWithKey>;
}

/* 视频列表选择 */
function VideoListSelect(props: VideoListSelectProps): ReactElement {
  const { value = [], onChange, dataSource }: VideoListSelectProps = props;
  const [selectKeys, setSelectKeys]: [Array<string>, D<S<Array<string>>>] = useState([]);
  const targetValue: Array<string> = useMemo((): Array<string> => value.map((o: VideoInfoWithKey): string => o.id), [value]);

  // 选择视频
  function handleSelectChange(target: Array<string>): void {
    setSelectKeys(target);
  }

  // 设置值
  function handleChange(target: Array<string>): void {
    onChange?.(dataSource.filter((o: VideoInfoWithKey): boolean => target.includes(o.id)));
  }

  return (
    <Transfer listStyle={{ width: 300, height: 230 }}
      titles={ ['视频列表', '下载'] }
      dataSource={ dataSource }
      selectedKeys={ selectKeys }
      targetKeys={ targetValue }
      rowKey={ (v: VideoInfoWithKey): string => v.id }
      render={ (v: VideoInfoWithKey): string => v.fileName }
      onSelectChange={ handleSelectChange }
      onChange={ handleChange }
    />
  );
}

export default VideoListSelect;