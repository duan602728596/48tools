import { randomUUID } from 'node:crypto';
import { useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Select, App } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { useAppProps } from 'antd/es/app/context';
import type { DashSupportFormats } from '@48tools-api/bilibili/download';
import { parseVideoUrlDASH, type ParseVideoUrlDASHObjectResult } from '../utils/parseBilibiliUrl';
import { setAddDownloadList } from '../../reducers/bilibiliDownload';
import { getUrlFromDash, type GetUrlFromDashReturn } from '../utils/getUrlFromDash';
import type { DashInfo } from '../../types';

interface DASHSelectProps {
  id: string;
  page: number;
}

/* 多分辨率下载dash */
function DASHSelect(props: DASHSelectProps): ReactElement {
  const { id, page }: DASHSelectProps = props;
  const dispatch: Dispatch = useDispatch();
  const [dash, setDash]: [DashInfo | undefined, D<S<DashInfo | undefined>>] = useState(undefined);
  const [options, setOptions]: [DefaultOptionType[], D<S<DefaultOptionType[]>>] = useState([]); // 分辨率列表
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载动画
  const { message: messageApi }: useAppProps = App.useApp();
  const bvid: string = id.replace(/^bv/i, '');

  // 选择分辨率，添加到下载列表
  function handleDownloadSelect(value: number, option: DefaultOptionType): void {
    if (!dash) return;

    const { videoUrl, audioUrl }: GetUrlFromDashReturn = getUrlFromDash(dash, value);

    dispatch(setAddDownloadList({
      qid: randomUUID(),
      durl: '',
      pic: dash.pic,
      type: 'bv',
      id: bvid,
      page: page ?? 1,
      dash: { video: videoUrl, audio: audioUrl },
      title: dash.title
    }));
    messageApi.success('添加到下载队列！');
  }

  // 获得焦点时，加载分辨率列表
  async function handleGetDataFocus(event: FocusEvent): Promise<void> {
    if (loading || dash) return;

    setLoading(true);

    try {
      const res: ParseVideoUrlDASHObjectResult | undefined = await parseVideoUrlDASH('bv', bvid, page, undefined);

      if (res && res?.videoData?.dash) {
        setDash({
          dash: res.videoData.dash,
          supportFormats: res.videoData.support_formats,
          pic: res.pic,
          title: res.title
        });

        setOptions((res.videoData.support_formats ?? []).map((o: DashSupportFormats): DefaultOptionType => ({
          label: o.new_description,
          value: o.quality
        })));
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <Select className="w-full"
      options={ options }
      loading={ loading }
      placeholder="选择其他分辨率"
      onFocus={ handleGetDataFocus }
      onSelect={ handleDownloadSelect }
    />
  );
}

export default DASHSelect;