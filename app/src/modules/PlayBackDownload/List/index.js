/* 下载列表 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Icon, Affix, Progress } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { downloadList, fnReady } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { onChromeDownloadsCreated, onChromeDownloadsChanged } from '../chromeFunction';
const fs = global.require('fs');

/* 初始化数据 */
const getIndex = (state)=>state.get('playBackDownload').get('index');

const state = createStructuredSelector({
  downloadList: createSelector(         // 下载列表
    (state)=>state.get('playBackDownload').get('downloadList'),
    (data)=>data
  ),
  fnReady: createSelector(              // 下载事件监听
    (state)=>state.get('playBackDownload').get('fnReady'),
    (data)=>data
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    downloadList,
    fnReady
  }, dispatch)
});

class ListOne extends Component{
  constructor(props){
    super(props);

    this.state = {
      timer: null,  // 定时器
      percent: 0    // 进度条
    };
  }
  componentDidMount(){
    // 进度条的定时器
    const { detail } = this.props;
    const { state } = detail[1];
    if(state === 1){
      this.setState({
        timer: global.setInterval(this.timer.bind(this), 300)
      });
    }
  }
  timer(){
    const { detail } = this.props;
    const { current, infor, state } = detail[1];
    fs.stat(current + '.crdownload', (err, state2)=>{
      if(state !== 1){
        clearInterval(this.state.timer);
        this.setState({
          timer: null,
          percent: 100
        });
      }else{
        const percent = (state2.size / infor.totalBytes * 100).toFixed(0);
        this.setState({
          percent: Number(percent)
        });
      }
    });
  }
  componentWillUnmount(){
    if(this.state.timer){
      global.clearInterval(this.state.timer);
    }
  }
  stateView(){
    const { detail } = this.props;
    const { state } = detail[1];
    switch(state){
      case 1:
        return(
          <Button className={ publicStyle.fr } type="danger" onClick={ this.onCancelDownload.bind(this, detail[0]) }>
            <Icon type="close-square" />
            <span>取消下载</span>
          </Button>
        );
      case 2:
        return(
          <div className={ publicStyle.fr }>
            <b className={ style.success }>下载完成</b>
          </div>
        );
      case 3:
        return(
          <div className={ publicStyle.fr }>
            <b className={ style.error }>取消下载</b>
          </div>
        );
    }
  }
  // 取消下载
  onCancelDownload(id, event){
    chrome.downloads.cancel(id);
  }
  render(){
    const { detail } = this.props;
    const { current, item, state } = detail[1];
    // 判断文件状态，避免渲染bug
    if(state !== 0){
      const { streamPath, title, subTitle } = item;
      return(
        <li>
          <div className={ commonStyle.clearfix }>
            <div className={ publicStyle.fl }>
              <p className={ style.line }>【{ title }】{ subTitle }：{ streamPath }</p>
              <p className={ style.line }>{ current }</p>
            </div>
            {  this.stateView() }
          </div>
          { state === 1 ? (<Progress percent={ this.state.percent } status="active" />) : null }
        </li>
      );
    }else{
      return false;
    }
  }
}

@withRouter
@connect(state, dispatch)
class List extends Component{
  // 组件挂载之前监听chrome下载事件
  componentWillMount(){
    if(this.props.fnReady === false){
      chrome.downloads.onCreated.addListener(onChromeDownloadsCreated);
      chrome.downloads.onChanged.addListener(onChromeDownloadsChanged);
      // 函数已监听的标识
      this.props.action.fnReady({
        fnReady: true
      });
    }
  }
  listOne(){
    return Array.from(this.props.downloadList).map((item, index)=>{
      return(
        <ListOne key={ item[0] } detail={ item } />
      );
    });
  }
  // 清除已下载
  onClear(event){
    this.props.downloadList.forEach((value, key)=>{
      if(value.state !== 1){
        this.props.downloadList.delete(key);
      }
    });
    this.props.action.downloadList({
      downloadList: new Map(Array.from(this.props.downloadList))
    });
  }
  render(){
    return(
      <div>
        {/* 功能区 */}
        <Affix>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fr }>
              <Button onClick={ this.onClear.bind(this) }>
                <Icon type="close-square" />
                <span>全部清除</span>
              </Button>
              <Link to="/PlayBackDownload">
                <Button className={ publicStyle.ml10 } type="danger">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Button>
              </Link>
            </div>
          </div>
        </Affix>

        <div className={ style.detailList }>
          <QueueAnim component="ul" type="alpha" leaveReverse={ true }>
            { this.listOne() }
          </QueueAnim>
        </div>
      </div>
    );
  }
}

export default List;
