/* 口袋48直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Icon, Affix, message } from 'antd';
import { liveList, liveCache, liveChange } from '../store/index';
import style from './style.sass';
import commonStyle from '../../../common.sass';
import post from '../../post';
import time from '../../time';
const child_process = node_require('child_process');
const path = node_require('path');
const process = node_require('process');
const __dirname = path.dirname(process.execPath).replace(/\\/g, '/');

/* 初始化数据 */
const state = createStructuredSelector({
  liveList: createSelector(    // 当前直播
    (state)=>state.get('liveCache').get('index'),
    (data)=>data.has('liveList') ? data.get('liveList') : []
  ),
  liveCache: createSelector(   // 当前直播录制
    (state)=>state.get('liveCache').get('index'),
    (data)=>data.has('liveCache') ? data.get('liveCache') : new Map()
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    liveList,
    liveCache,
    liveChange
  }, dispatch),
});

@connect(state, dispatch)
class LiveCache extends Component{
  constructor(props){
    super(props);

    this.state = {
      loading: false       // 表格的加载动画
    };
  }
  // 表格配置
  columus(){
    const columns = [
      {
        title: '直播ID',
        dataIndex: 'liveId',
        key: 'liveId',
        width: '20%'
      },
      {
        title: '直播间',
        dataIndex: 'title',
        key: 'title',
        width: '15%'
      },
      {
        title: '直播标题',
        dataIndex: 'subTitle',
        key: 'subTitle',
        width: '35%'
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        width: '15%',
        render: (text, item)=>time('YY-MM-DD hh:mm:ss', text)
      },
      {
        title: '操作',
        dataIndex: 'liveId',
        key: 'handle',
        width: '25%',
        render: (text, item)=>{
          if(this.props.liveCache.has(text)){
            const m = this.props.liveCache.get(text);
            if(m.child.exitCode === null){
              return(
                <Button type="danger" onClick={ this.stopRecording.bind(this, item) }>
                  <Icon type="close-square" />
                  <span>停止录制</span>
                </Button>
              );
            }else{
              return(
                <Button type="primary" onClick={ this.recording.bind(this, item) }>
                  <Icon type="play-circle-o" />
                  <span>录制</span>
                </Button>
              );
            }
          }else{
            return(
              <Button type="primary" onClick={ this.recording.bind(this, item) }>
                <Icon type="play-circle-o" />
                <span>录制</span>
              </Button>
            );
          }
        }
      }
    ];
    return columns;
  }
  // 子进程监听
  child_process_exit(item, code, data){
    console.log('exit: ' + code + ' ' + data);
    this.props.liveCache.delete(item.liveId);
    this.props.action.liveChange({
      map: this.props.liveCache,
      liveList: this.props.liveList.slice()
    });
  }
  child_process_error(item, err){
    console.error('error: \n' + err);
    this.props.liveCache.delete(item.liveId);
    this.props.action.liveChange({
      map: this.props.liveCache,
      liveList: this.props.liveList.slice()
    });
  }
  // 录制视频
  recording(item, event){
    const title = item.liveId + '_' + item.title +
                  '_starttime_' + time('YY-MM-DD-hh-mm-ss', item.startTime) +
                  '_recordtime_' + time('YY-MM-DD-hh-mm-ss');
    const child = child_process.spawn(__dirname + '/ffmpeg/ffmpeg.exe', [
      '-i',
      `${ item.streamPath }`,
      '-c',
      'copy',
      `${ __dirname }/output/${ title }.flv`
    ]);

    child.on('exit', this.child_process_exit.bind(this, item));
    child.on('error', this.child_process_error.bind(this, item));

    this.props.liveCache.set(item.liveId, {
      child: child,
      item: item
    });
    this.props.action.liveChange({
      map: this.props.liveCache,
      liveList: this.props.liveList.slice()
    });
  }
  // 停止录制视频
  stopRecording(item, event){
    const m = this.props.liveCache.get(item.liveId);
    m.child.kill();
  }
  // 获取录制列表
  async getLiveList(event){
    this.setState({
      loading: true
    });
    const data = await post(0);
    const data2 = JSON.parse(data);
    if(data2.status === 200){
      message.success('请求成功');
      this.props.action.liveList({
        liveList: 'liveList' in data2.content ? data2.content.liveList : []
      });
    }else{
      message.error('请求失败');
    }
    this.setState({
      loading: false
    });
  }
  render(){
    return(
      <div>
        {/* 功能区 */}
        <Affix>
          <div className={ `${ style.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ style.fl }>
              <Button className={ style.mr10 } type="primary">
                <Icon type="play-circle" />
                <span>开始自动录制</span>
              </Button>
              <Button>
                <Icon type="setting" />
                <span>自动录制配置</span>
              </Button>
            </div>
            <div className={ style.fr }>
              <Button>
                <Icon type="bars" />
                <span>正在录制</span>
              </Button>
              <Button className={ style.ml10 } onClick={ this.getLiveList.bind(this) }>
                <Icon type="loading-3-quarters" />
                <span>刷新列表</span>
              </Button>
              <Button className={ style.ml10 } type="danger">
                <Link className={ style.back } to="/">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Link>
              </Button>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div className={ style.tableBox }>
          <Table loading={ this.state.loading }
                 bordered={ true }
                 columns={ this.columus() }
                 dataSource={ this.props.liveList }
                 pagination={{
                   pageSize: 20,
                   showQuickJumper: true
                 }} />
        </div>
      </div>
    );
  }
}

export default LiveCache;