import { Fragment, useRef, ReactElement, RefObject, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Image } from 'antd';
import style from './imagePreview.sass';

interface ImagePreviewProps {
  src?: string;
}

/* 图片预览 */
function ImagePreview(props: ImagePreviewProps): ReactElement {
  const divRef: RefObject<HTMLDivElement> = useRef(null);

  // 点击预览图片
  function handlePreviewClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (divRef.current) {
      // @ts-ignore
      divRef.current.querySelector('.ant-image-img')!.click();
    }
  }

  return (
    <Fragment>
      <a role="button" aria-label="点击预览图片" onClick={ handlePreviewClick }>预览</a>
      <div ref={ divRef } className={ style.image }>
        <Image src={ props.src } />
      </div>
    </Fragment>
  );
}

ImagePreview.propTypes = {
  src: PropTypes.string
};

export default ImagePreview;