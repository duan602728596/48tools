import React, { Fragment } from 'react';
import { Row, Col } from 'antd';
import Add from './Add';
import DownloadList from './DownloadList';
import style from './index.sass';

function Index(props) {
  return (
    <Fragment>
      <Row className={ style.box } type="flex" gutter={ 8 }>
        <Col xs={ 24 } sm={ 24 } md={ 24 } lg={ 8 } xl={ 6 } xxl={ 6 }>
          <Add />
        </Col>
        <Col xs={ 24 } sm={ 24 } md={ 24 } lg={ 16 } xl={ 18 } xxl={ 18 }>
          <DownloadList />
        </Col>
      </Row>
    </Fragment>
  );
}

export default Index;