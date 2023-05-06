import {
  Fragment,
  useState,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type ChangeEvent
} from 'react';
import { Input, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import style from './search.sass';
import { requestShortVideo } from '../../services/videoDownload';
import type { ShortVideoDownloadResponse } from '../../services/interface';

/* 根据ID或视频url搜索 */
function Search(props: {}): ReactElement {
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [urlLoading, setUrlLoading]: [boolean, D<S<boolean>>] = useState(false);

  // 解析视频地址
  async function handleGetVideoInfoSearch(value: string, event: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (/^\s*$/.test(value)) return;

    const res: ShortVideoDownloadResponse = await requestShortVideo(value);
  }

  return (
    <Fragment>
      <Input.Search className={ style.input }
        enterButton="解析视频"
        placeholder="输入视频ID、用户ID或用户主页地址"
        loading={ urlLoading }
        onSearch={ handleGetVideoInfoSearch }
      />
    </Fragment>
  );
}

export default Search;