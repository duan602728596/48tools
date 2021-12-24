import { Fragment, useRef, type ReactElement, type RefObject, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { Image } from 'antd';

interface ImagePreviewProps {
  src?: string;
}

/* 图片预览 */
function ImagePreview(props: ImagePreviewProps): ReactElement {
  const divRef: RefObject<HTMLDivElement> = useRef(null);

  // 点击预览图片
  function handlePreviewClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (divRef.current) {
      divRef.current.querySelector<HTMLElement>('.ant-image-img')!.click();
    }
  }

  return (
    <Fragment>
      <a role="button" aria-label="点击预览图片" onClick={ handlePreviewClick }>预览</a>
      <div ref={ divRef } className="hidden">
        <Image src={ props.src } />
      </div>
    </Fragment>
  );
}

ImagePreview.propTypes = {
  src: PropTypes.string
};

export default ImagePreview;