// @flow
/* 查看录播详细信息 */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button } from 'antd';
import style from './style.sass';
import { time } from '../../../function';

@withRouter
class Detail extends Component{
  componentWillMount(): void{
    // 如果没有传参，就返回到“/PlayBackDownload”页面
    if(!('query' in this.props.location && 'detail' in this.props.location.query)){
      this.props.history.push('/PlayBackDownload');
    }
  }
  render(): Object{
    // 直播id，成员id，开始时间，下载地址，直播标题，直播间标题
    const { liveId, memberId, startTime, streamPath, picPath, subTitle, title}: {
      liveId: string,
      memberId: string,
      startTime: number,
      streamPath: string,
      picPath: string,
      subTitle: string,
      title: string
    } = this.props.location.query.detail;

    const { current }: { current: number } = this.props.location.query;

    return (
      <div className={ style.body }>
        <Link to={{
          pathname: '/PlayBackDownload',
          query: {
            current
          }
        }}>
          <Button className={ style.btn } type="danger" icon="poweroff">返回</Button>
        </Link>
        <div className={ style.textList }>
          <p className={ style.text }>
            <b>liveId:</b>
            <span>{ liveId }</span>
          </p>
          <p className={ style.text }>
            <b>title:</b>
            <span>{ title }</span>
          </p>
          <p className={ style.text }>
            <b>subTitle:</b>
            <span>{ subTitle }</span>
          </p>
          <p className={ style.text }>
            <b>memberId:</b>
            <span>{ memberId }</span>
          </p>
          <p className={ style.text }>
            <b>startTime:</b>
            <span>{ time('YY-MM-DD hh:mm:ss', startTime) }</span>
          </p>
          <p className={ style.text }>
            <b>streamPath:</b>
            <span>{ streamPath }</span>
          </p>
        </div>
      </div>
    );
  }
}

export default Detail;