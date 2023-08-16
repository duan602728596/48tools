import type { ReactElement } from 'react';
import { Space } from 'antd';
import ButtonLink from '../../components/ButtonLink/ButtonLink';

function Agreement(props: {}): ReactElement {
  return (
    <div className="py-[32px] text-center">
      <Space>
        <ButtonLink linkProps={{ to: '/' }} buttonProps={{ type: 'primary', danger: true }}>返回</ButtonLink>
        <ButtonLink linkProps={{ to: '/Agreement/Power' }}>软件声明</ButtonLink>
        <ButtonLink linkProps={{ to: '/Agreement/Credits' }}>许可证和开源软件</ButtonLink>
      </Space>
    </div>
  );
}

export default Agreement;