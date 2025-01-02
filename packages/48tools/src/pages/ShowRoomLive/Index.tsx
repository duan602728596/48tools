import type { ReactElement } from 'react';
import Header from '../../components/Header/Header';
import AddLiveRoomForm from '../../components/AddLiveRoomForm/AddLiveRoomForm';
import Content from '../../components/Content/Content';
import { IDBSaveLiveItem } from './reducers/showroomLive';

function Index(props: {}): ReactElement {
  return (
    <Content>
      <Header>
        <AddLiveRoomForm modalTitle="添加SHOWROOM直播间信息" IDBSaveDataFunc={ IDBSaveLiveItem } />
      </Header>
    </Content>
  );
}

export default Index;