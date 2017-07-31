/* 口袋48直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Icon, Affix, message } from 'antd';
import { liveList, liveCache, liveChange, autoRecording } from '../store/index';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import post from '../../pubmicMethod/post';
import { time } from '../../../function';
import IndexedDB from '../../pubmicMethod/IndexedDB';
import option from '../../pubmicMethod/option';
const child_process = node_require('child_process');
const path = node_require('path');
const process = node_require('process');
const __dirname = path.dirname(process.execPath).replace(/\\/g, '/');

/* 初始化数据 */
const getIndex = (state)=>state.get('liveCache').get('index');

const state = createStructuredSelector({
  liveList: createSelector(         // 当前直播
    getIndex,
    (data)=>data.has('liveList') ? data.get('liveList') : []
  ),
  liveCache: createSelector(        // 当前直播录制
    getIndex,
    (data)=>data.has('liveCache') ? data.get('liveCache') : new Map()
  ),
  autoRecording: createSelector(    // 自动抓取直播
    getIndex,
    (data)=>data.has('autoRecording') ? data.get('autoRecording') : null
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    liveList,
    liveCache,
    liveChange,
    autoRecording
  }, dispatch),
});

/* 数据库获取自动录制的配置 */
function getLiveCacheOption(){
  return new Promise((resolve, reject)=>{
    IndexedDB(option.indexeddb.name, option.indexeddb.version, {
      success: function(event){
        const store = this.getObjectStore('liveCache', true);
        const _this = this;
        store.get('liveCacheOption', function(result){
          if(result){
            resolve(result.option);
          }else{
            resolve({
              time: 1,
              humans: []
            });
          }
          _this.close();
        });
      }
    });
  });
}

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
  /**
   * 子进程监听
   * 子进程关闭时自动删除itemId对应的Map
   */
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
    const title = '口袋48直播_' + item.liveId + '_' + item.title +
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
  /**
   * 录制
   * 使用Promise进行了包装
   */
  recordingPromise(item){
    return new Promise((resolve, reject)=>{
      const title = '口袋48直播_' + item.liveId + '_' + item.title +
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
      resolve();
    });
  }
  // 自动录制的进程
  async autoRecordingProcess(humans){
    this.setState({
      loading: true
    });
    // 获取列表
    const data = await post(0);
    const data2 = JSON.parse(data);
    if(data2.status === 200){
      message.success('请求成功');
      const liveList = 'liveList' in data2.content ? data2.content.liveList : [];

      // 获取列表成功后开始构建录制进程
      const queue = [];                                            // Promise.all进程
      const humanRegExp = new RegExp(`(${ humans.join('|') })`);   // 正则
      liveList.map((item, index)=>{
        // 有录制的进程
        if(this.props.liveCache.has(item.liveId)){
          const m = this.props.liveCache.get(item.liveId);
          // 录制由于特殊原因已经结束，如断线等
          if(m.child.exitCode !== null){
            // 此处用正则表达式判断指定的成员
            if(humanRegExp.test(item.title)){
              queue.push(this.recordingPromise(item));
            }
          }
        // 没有录制进程
        }else{
          // 此处用正则表达式判断指定的成员
          if(humanRegExp.test(item.title)){
            queue.push(this.recordingPromise(item));
          }
        }
      });

      // 启动所有的录制进程
      await Promise.all(queue);
      this.props.action.liveChange({
        map: this.props.liveCache,
        liveList: liveList
      });
    }else{
      message.error('请求失败');
    }
    this.setState({
      loading: false
    });
  }
  // 自动录制
  async onAutoRecording(event){
    const data = await getLiveCacheOption();
    this.autoRecordingProcess(data.humans);
    this.props.action.autoRecording({
      autoRecording: setInterval(this.autoRecordingProcess.bind(this), data.time * 60 * (10 ** 3), data.humans)
    });
  }
  // 停止自动录制（停止的是定时器，已经录制的不会停止）
  onStopAutoRecording(event){
    clearInterval(this.props.autoRecording);
    this.props.action.autoRecording({
      autoRecording: null
    });
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
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fl }>
              {
                this.props.autoRecording ?
                  (
                    <Button className={ publicStyle.mr10 } type="danger" onClick={ this.onStopAutoRecording.bind(this) }>
                      <Icon type="close-square" />
                      <span>停止自动录制</span>
                    </Button>
                  ) :
                  (
                    <Button className={ publicStyle.mr10 } type="primary" onClick={ this.onAutoRecording.bind(this) }>
                      <Icon type="play-circle" />
                      <span>开始自动录制</span>
                    </Button>
                  )
              }
              <Button className={ publicStyle.btn } disabled={ this.props.autoRecording }>
                <Icon type="setting" />
                <span>自动录制配置</span>
                <Link className={ publicStyle.btnLink } to="/LiveCache/Option" />
              </Button>
            </div>
            <div className={ publicStyle.fr }>
              <Button>
                <Icon type="bars" />
                <span>正在录制</span>
              </Button>
              <Button className={ publicStyle.ml10 } onClick={ this.getLiveList.bind(this) }>
                <Icon type="loading-3-quarters" />
                <span>刷新列表</span>
              </Button>
              <Button className={ `${ publicStyle.ml10 } ${ publicStyle.btn }` } type="danger">
                <Icon type="poweroff" />
                <span>返回</span>
                <Link className={ publicStyle.btnLink } to="/" />
              </Button>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div className={ publicStyle.tableBox }>
          <Table loading={ this.state.loading }
                 bordered={ true }
                 columns={ this.columus() }
                 rowKey={ (item)=>item.liveId }
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