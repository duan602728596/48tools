import type { ReactElement } from 'react';
import Content from '../../components/Content/Content';
import Header from '../../components/Header/Header';
import CutForm from './CutForm';

/* 视频快速裁剪 */
function Index(props: {}): ReactElement {
  return (
    <Content>
      <Header />
      <CutForm />
    </Content>
  );
}

export default Index;