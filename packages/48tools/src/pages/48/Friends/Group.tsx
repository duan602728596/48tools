import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Row, Col, Divider, Button, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import { requestFriendshipAdd } from '@48tools-api/48';
import type { RoomItem } from '@48tools-api/48/jsdelivrCDN';
import * as classNames from 'classnames';
import commonStyle from '../../../common.sass';
import style from './group.sass';

const colProps: Record<string, number> = { xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 };

interface GroupProps {
  title: string;
  data: Array<RoomItem>;
  readonly disableClick: boolean;
  readonly setDisableClick: D<S<boolean>>;
}

/* 渲染组 */
function Group(props: GroupProps): ReactElement {
  const { title, data, disableClick, setDisableClick }: GroupProps = props;
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [loading, setLoading]: [boolean, D<S<boolean>>] = useState(false);
  const [successIds, setSuccessIds]: [Array<number>, D<S<Array<number>>>] = useState([]);

  // 点击一键关注
  async function handleAddClick(event: MouseEvent): Promise<void> {
    setDisableClick(true);
    setLoading(true);

    for (const item of data) {
      try {
        await requestFriendshipAdd(item.id);
        setSuccessIds((prevState: number[]): number[] => prevState.concat([item.id]));
        await setTimeoutPromise(1_500);
      } catch (err) {
        console.error(err);
      }
    }

    messageApi.success('全部关注完毕！');
    setDisableClick(false);
    setLoading(false);
    setSuccessIds([]);
  }

  // 渲染
  function renderItem(): Array<ReactElement> {
    return data.map((item: RoomItem): ReactElement => {
      return (
        <Col key={ item.id }
          className={ successIds.includes(item.id) ? style.loadingText : undefined }
          { ...colProps }
        >
          { item.ownerName }
        </Col>
      );
    });
  }

  return (
    <Fragment>
      <h4 className={ commonStyle.text }>{ title }</h4>
      <Row className={ classNames('text-[12px]', commonStyle.text) } gutter={ [8, 8] }>{ renderItem() }</Row>
      <Button className="mt-[16px]" type="primary" disabled={ disableClick } loading={ loading } onClick={ handleAddClick }>
        一键关注
      </Button>
      <Divider />
      { messageContextHolder }
    </Fragment>
  );
}

export default Group;