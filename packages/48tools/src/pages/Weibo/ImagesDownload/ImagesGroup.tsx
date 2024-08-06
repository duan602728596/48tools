import type { ReactElement, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Image, Tag } from 'antd';
import {
  CheckSquareTwoTone as IconCheckSquareTwoTone,
  GifOutlined as IconGifOutlined,
  VideoCameraOutlined as IconVideoCameraOutlined
} from '@ant-design/icons';
import * as classNames from 'classnames';
import style from './imagesDownload.sass';
import { setImageCheckedItem } from '../reducers/weiboImagesDownload';
import imageLoadedError from '../images/imageLoadedError.svg';
import type { WeiboImageItem, WeiboImagesGroup } from '../types';

interface ImagesGroupProps {
  item: WeiboImagesGroup;
  index: number;
}

/* 分组显示图片 */
function ImagesGroup(props: ImagesGroupProps): ReactElement {
  const { item }: ImagesGroupProps = props;
  const dispatch: Dispatch = useDispatch();

  // 鼠标右键事件
  function handleCheckedContextMenu(o: WeiboImageItem, event: MouseEvent): void {
    event.preventDefault();
    dispatch(setImageCheckedItem(o.pid));
  }

  // 自定义渲染
  function renderImage(o: WeiboImageItem): () => ReactElement {
    return function(): ReactElement {
      return <video className="max-w-full max-h-full" src={ o.infos.video! } controls={ true } />;
    };
  }

  // 渲染单个图片
  function renderItem(): Array<ReactElement> {
    return item.items.map((o: WeiboImageItem): ReactElement => {
      // 图片错误处理
      if (!o.infos) {
        return (
          <div key={ o.pid } className="grow-0 shrink-0 p-[4px] w-[92px] h-[92px]">
            <Image src={ imageLoadedError } width={ 92 } height={ 92 } preview={ false } />
          </div>
        );
      }

      // 图片渲染
      return (
        <div key={ o.pid }
          className={ classNames('grow-0 shrink-0 relative p-[4px] w-[92px] h-[92px]', o.checked ? style.checked : undefined) }
          role="checkbox"
          onContextMenu={ (event: MouseEvent): void => handleCheckedContextMenu(o, event) }
        >
          <Image className="object-cover"
            src={ o.infos.thumbnail.url }
            preview={{ src: o.infos.largest.url, imageRender: o.type === 'gif' || o.type === 'livephoto' ? renderImage(o) : undefined }}
            width={ 92 }
            height={ 92 }
          />
          { o.checked ? <IconCheckSquareTwoTone className="absolute z-10 top-[8px] right-[8px] text-[14px]" /> : null }
          {
            o.type === 'gif' ? (
              <Tag className="absolute z-10 left-[8px] bottom-[8px] text-[14px]">
                <IconGifOutlined />
              </Tag>
            ) : null
          }
          {
            o.type === 'livephoto' ? (
              <Tag className="absolute z-10 left-[8px] bottom-[8px] text-[14px]">
                <IconVideoCameraOutlined />
              </Tag>
            ) : null
          }
        </div>
      );
    });
  }

  return <div className="flex">{ renderItem() }</div>;
}

export default ImagesGroup;