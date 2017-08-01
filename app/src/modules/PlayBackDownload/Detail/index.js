/* 查看录播详细信息 */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button, Icon } from 'antd';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import { time } from '../../../function';

@withRouter
class Detail extends Component{
  componentWillMount(){
    // 如果没有传参，就返回到“/PlayBackDownload”页面
    if(!('query' in this.props.location && 'detail' in this.props.location.query)){
      this.props.history.push('/PlayBackDownload');
    }
  }
  render(){
    // 直播id，成员id，开始时间，下载地址，直播标题，直播间标题
    const { liveId, memberId, startTime, streamPath, subTitle, title} = this.props.location.query.detail;

    return(
      <div className={ style.body }>
        <video className={ style.video } src={ streamPath } controls />
        <Button className={ `${ style.btn } ${ publicStyle.btn }` } type="danger">
          <Icon type="poweroff" />
          <span>返回</span>
          <Link className={ publicStyle.btnLink } to="/PlayBackDownload" />
        </Button>
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