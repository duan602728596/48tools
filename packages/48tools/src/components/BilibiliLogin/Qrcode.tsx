import { Fragment, useRef, ReactElement, RefObject } from 'react';
import * as qrcode from 'qrcode/lib/browser';
import style from './qrcode.sass';

/* 二维码扫描、刷新等 */
function Qrcode(props: {}): ReactElement {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);

  return (
    <Fragment>
      <div className={ style.qrcodeBox }>
        <canvas ref={ canvasRef } width={ 100 } height={ 100 } />
      </div>
    </Fragment>
  );
}

export default Qrcode;