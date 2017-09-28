// @flow
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
const fs = node_require('fs');

/* 初始化数据 */
const state: Function = createStructuredSelector({
  downloadList: createSelector(         // 下载列表
    (state: Object): Map=>state.has('playBackDownload') ? state.get('playBackDownload').get('downloadList') : new Map(),
    (data: Map): Map=>data
  ),
  fnReady: createSelector(              // 下载事件监听
    (state: Object): boolean=>state.has('playBackDownload') ? state.get('playBackDownload').get('fnReady') : false,
    (data: boolean): boolean=>data
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    downloadList,
    fnReady
  }, dispatch)
});

class ListOne extends Component{
  state: {
    timer: ?number,
    percent: number
  };
  constructor(props: ?Object): void{
    super(props);

    this.state = {
      timer: null,  // 定时器
      percent: 0    // 进度条
    };
  }
  componentDidMount(): void{
    // 进度条的定时器
    const { detail }: { detail: Array } = this.props;
    const { state }: { state: number } = detail[1];
    if(state && state === 1){
      this.setState({
        timer: requestAnimationFrame(this.timer.bind(this))
      });
    }
  }
  timer(): void{
    const { detail }: { detail: Array } = this.props;
    const { current, infor, state }: {
      current: string,
      infor: Object,
      state: number
    } = detail[1];
    fs.stat(current + '.crdownload', (err: ?any, state2: Object)=>{
      if(state !== 1){
        this.setState({
          timer: null,
          percent: 100
        });
      }else{
        const percent: number = Number((state2.size / infor.totalBytes * 100).toFixed(0));
        this.setState({
          timer: requestAnimationFrame(this.timer.bind(this)),
          percent: percent
        });
      }
    });
  }
  componentWillUnmount(): void{
    if(this.state.timer){
      cancelAnimationFrame(this.state.timer);
    }
  }
  stateView(): Object | boolean{
    const { detail }: { detail: Array } = this.props;
    const { state }: { state: number } = detail[1];
    switch(state){
      case 1:
        return (
          <Button className={ publicStyle.fr } type="danger" onClick={ this.onCancelDownload.bind(this, detail[0]) }>
            <Icon type="close-square" />
            <span>取消下载</span>
          </Button>
        );
      case 2:
        return (
          <div className={ publicStyle.fr }>
            <b className={ style.success }>下载完成</b>
          </div>
        );
      case 3:
        return (
          <div className={ publicStyle.fr }>
            <b className={ style.error }>取消下载</b>
          </div>
        );
      default:
        return false;
    }
  }
  // 取消下载
  onCancelDownload(id: number, event: Object): void{
    chrome.downloads.cancel(id);
  }
  render(): Object | boolean{
    const { detail }: { detail: Array } = this.props;
    const { current, item, state }: {
      current: string,
      item: Object,
      state: number
    } = detail[1];
    // 判断文件状态，避免渲染bug
    if(state && state !== 0){
      const { streamPath, title, subTitle }: {
        streamPath: string,
        title: string,
        subTitle: string
      } = item;
      return (
        <div>
          <div className={ commonStyle.clearfix }>
            <div className={ publicStyle.fl }>
              <p className={ style.line }>【{ title }】{ subTitle }：{ streamPath }</p>
              <p className={ style.line }>{ current }</p>
            </div>
            {  this.stateView() }
          </div>
          {
            /* 判断是否显示进度条 */
            state === 1 ? (
              <Progress percent={ this.state.percent } status="active" />
            ) : null
          }
        </div>
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
  componentWillMount(): void{
    if(this.props.fnReady === false){
      chrome.downloads.onCreated.addListener(onChromeDownloadsCreated);
      chrome.downloads.onChanged.addListener(onChromeDownloadsChanged);
      // 函数已监听的标识
      this.props.action.fnReady({
        fnReady: true
      });
    }
  }
  listOne(): Object{
    return Array.from(this.props.downloadList).map((item: Array, index: number): Object=>{
      if(item[1].state !== 0){
        return (
          <li key={ item[0] }>
            <ListOne detail={ item } />
          </li>
        );
      }
    });
  }
  // 清除已下载
  onClear(event: Object): void{
    const dl = this.props.downloadList instanceof Array ? this.props.downloadList : [];
    this.props.downloadList.forEach((value: Object, key: number): void=>{
      if(value.state !== 1){
        this.props.downloadList.delete(key);
      }
    });
    this.props.action.downloadList({
      downloadList: new Map(Array.from(this.props.downloadList))
    });
  }
  render(): Array{
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
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
      </Affix>,
      <div key={ 1 } className={ `${ publicStyle.tableBox } ${ style.detailList }` }>
        <QueueAnim component="ul" type="alpha" leaveReverse={ true }>
          { this.listOne() }
        </QueueAnim>
      </div>
    ];
  }
}

export default List;
