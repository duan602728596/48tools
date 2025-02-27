import type { ReactElement, MouseEvent } from 'react';
import { useNavigate, useSearchParams, type NavigateFunction, type SetURLSearchParams } from 'react-router';
import { Typography, Button } from 'antd';
import Header from '../../../components/Header/Header';
import PowerText from './PowerText.mdx';
import { setReadPower } from '../utils/helper';

/* 声明 */
function Power(props: {}): ReactElement {
  const navigate: NavigateFunction = useNavigate();
  const [searchParams]: [URLSearchParams, SetURLSearchParams] = useSearchParams();
  const read: string | null = searchParams.get('read');

  // 同意并开始使用
  function handleAgreeClick(event: MouseEvent): void {
    setReadPower();
    navigate('/');
  }

  return (
    <div className="p-[16px]">
      { read ? null : <Header to="/Agreement/Agreement" /> }
      <Typography>
        <PowerText />
      </Typography>
      {
        read ? (
          <div className="pt-[8px] text-center">
            <Button type="primary" onClick={ handleAgreeClick }>同意并开始使用</Button>
          </div>
        ) : null
      }
    </div>
  );
}

export default Power;