import { randomUUID } from 'node:crypto';
import { useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Select, App } from 'antd';
import type { DefaultOptionType } from 'rc-select/es/Select';
import type { useAppProps } from 'antd/es/app/context';
import { setAddDownloadList } from '../../reducers/bilibiliDownload';
import { BilibiliScrapy, BilibiliVideoType, type BilibiliVideoInfoItem, type BilibiliVideoResultItem } from '../../../../scrapy/bilibili/BilibiliScrapy';
import type { DashInfoV2 } from '../../types';

interface DASHSelectProps {
  id: string;
  page: number;
}

/* 多分辨率下载dash */
function DASHSelect(props: DASHSelectProps): ReactElement {
  const { id, page }: DASHSelectProps = props;
  const dispatch: Dispatch = useDispatch();
  const [dash, setDash]: [DashInfoV2 | undefined, D<S<DashInfoV2 | undefined>>] = useState(undefined);
  const [options, setOptions]: [DefaultOptionType[], D<S<DefaultOptionType[]>>] = useState([]); // 分辨率列表
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false); // 加载动画
  const { message: messageApi }: useAppProps = App.useApp();
  const bvid: string = id.replace(/^bv/i, '');

  // 选择分辨率，添加到下载列表
  function handleDownloadSelect(value: number, option: DefaultOptionType): void {
    if (!dash) return;

    const item: BilibiliVideoInfoItem = option.item;

    dispatch(setAddDownloadList({
      qid: randomUUID(),
      durl: '',
      pic: dash.pic,
      type: BilibiliVideoType.BV,
      id: bvid,
      page: page ?? 1,
      dash: { video: item.videoUrl, audio: item.audioUrl! },
      title: dash.title
    }));
    messageApi.success('添加到下载队列！');
  }

  // 获得焦点时，加载分辨率列表
  async function handleGetDataFocus(event: FocusEvent): Promise<void> {
    if (loading || dash) return;

    setLoading(true);

    try {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.BV,
        id: bvid,
        page: page ?? 1
      });

      await bilibiliScrapy.parse();
      await bilibiliScrapy.asyncLoadVideoInfoByPage();

      if (bilibiliScrapy.error) return;

      const item: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();

      setDash({
        dash: item.videoInfo,
        type: bilibiliScrapy.type!,
        id: bilibiliScrapy.id!,
        title: bilibiliScrapy.title === item.title ? item.title : `${ bilibiliScrapy.title } ${ item.title }`,
        page: bilibiliScrapy.page,
        pic: item.cover
      });
      setOptions(item.videoInfo.map((o: BilibiliVideoInfoItem): DefaultOptionType => ({
        key: `${ o.quality }-${ o.videoUrl }`,
        label: o.qualityDescription,
        value: o.quality,
        item: o,
        title: bilibiliScrapy.title === item.title ? item.title : `${ bilibiliScrapy.title } ${ item.title }`
      })));
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