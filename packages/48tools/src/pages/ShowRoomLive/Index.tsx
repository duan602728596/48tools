import { Fragment, type ReactElement } from 'react';
import Header from '../../components/Header/Header';
import AddLiveRoomForm from '../../components/AddLiveRoomForm/AddLiveRoomForm';
import Content from '../../components/Content/Content';
import { IDBSaveLiveItem } from './reducers/showroomLive';
import ShowroomTextIcon from '../Index/ShowroomTextIcon/ShowroomTextIcon';

function Index(props: {}): ReactElement {
  return (
    <Content>
      <Header>
        <AddLiveRoomForm modalTitle={
          <Fragment>
            添加
            <span className="font-normal">{ ShowroomTextIcon }</span>
            直播间信息
          </Fragment>
        } IDBSaveDataFunc={ IDBSaveLiveItem } />
      </Header>
    </Content>
  );
}

export default Index;