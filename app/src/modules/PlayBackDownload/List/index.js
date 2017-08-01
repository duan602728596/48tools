/* 下载列表 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Icon, Affix } from 'antd';
import { downloadList, fnReady } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { onChromeDownloadsCreated, onChromeDownloadsChanged } from '../chromeFunction';

/* 初始化数据 */
const getIndex = (state)=>state.get('playBackDownload').get('index');

const state = createStructuredSelector({
  downloadList: createSelector(         // 下载列表
    (state)=>state.get('playBackDownload').get('downloadList'),
    (data)=>data
  ),
  fnReady: createSelector(             // 下载事件监听
    (state)=>state.get('playBackDownload').get('fnReady'),
    (data)=>data
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    downloadList,
    fnReady
  }, dispatch),
});

@withRouter
@connect(state, dispatch)
class List extends Component{
  // 组件挂载之前监听chrome下载事件
  componentWillMount(){
    if(this.props.fnReady === false){
      chrome.downloads.onCreated.addListener(onChromeDownloadsCreated.bind(this));
      chrome.downloads.onChanged.addListener(onChromeDownloadsChanged.bind(this));
      // 函数已监听的标识
      this.props.action.fnReady({
        fnReady: true
      });
    }
  }
  render(){
    return(
      <div>下载列表</div>
    );
  }
}

export default List;
