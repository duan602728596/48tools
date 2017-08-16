// @flow
/* 口袋48直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Icon, Affix, message, Popconfirm } from 'antd';
import { liveList, liveCatch, liveChange, autoRecording } from '../store/index';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import post from '../../pubmicMethod/post';
import { time } from '../../../function';
import { getAutoRecordingOption } from '../store/reducer';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
const child_process = node_require('child_process');
const path = node_require('path');
const process = node_require('process');
const __dirname = path.dirname(process.execPath).replace(/\\/g, '/');

/* 初始化数据 */
const getIndex: Function = (state: Object): Object=>state.get('liveCatch').get('index');

const state: Object = createStructuredSelector({
  liveList: createSelector(         // 当前直播
    getIndex,
    (data: Object): Array=>data.has('liveList') ? data.get('liveList') : []
  ),
  liveCatch: createSelector(        // 当前直播录制
    getIndex,
    (data: Object): Map=>data.has('liveCatch') ? data.get('liveCatch') : new Map()
  ),
  autoRecording: createSelector(    // 自动抓取直播定时器
    getIndex,
    (data: Object): ?number=>data.has('autoRecording') ? data.get('autoRecording') : null
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    liveList,
    liveCatch,
    liveChange,
    autoRecording,
    getAutoRecordingOption
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class LiveCatch extends Component{
  state: {
    loading: boolean
  };
  constructor(props: ?Object): void{
    super(props);

    this.state = {
      loading: false       // 表格的加载动画
    };
  }
  // 表格配置
  columus(): Array{
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
        render: (text: any, item: Object): string=>time('YY-MM-DD hh:mm:ss', text)
      },
      {
        title: '操作',
        dataIndex: 'liveId',
        key: 'handle',
        width: '25%',
        render: (text: any, item: Object): Object=>{
          if(this.props.liveCatch.has(text)){
            const m: Object = this.props.liveCatch.get(text);
            if(m.child.exitCode === null){
              return(
                <Popconfirm title="确认停止录制吗？" onConfirm={ this.stopRecording.bind(this, item) }>
                  <Button type="danger">
                    <Icon type="close-square" />
                    <span>停止录制</span>
                  </Button>
                </Popconfirm>
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
  // 录制视频
  recording(item: Object, event: Object): void{
    const title: string = '【口袋48直播】_' + item.liveId + '_' + item.title +
      '_starttime_' + time('YY-MM-DD-hh-mm-ss', item.startTime) +
      '_recordtime_' + time('YY-MM-DD-hh-mm-ss');
    const child: Object = child_process.spawn(`${ __dirname }/dependent/ffmpeg/ffmpeg.exe`, [
      `-i`,
      `${ item.streamPath }`,
      `-c`,
      `copy`,
      `${ __dirname }/output/${ title }.flv`
      ]
    );
    child.stdout.on('data', child_process_stdout);
    child.stderr.on('data', child_process_stderr);
    child.on('close', child_process_exit);
    child.on('error', child_process_error);

    this.props.liveCatch.set(item.liveId, {
      child: child,
      item: item
    });
    this.props.action.liveChange({
      map: this.props.liveCatch,
      liveList: this.props.liveList.slice()
    });
  }
  // 停止录制视频
  stopRecording(item: Object, event: Object): void{
    const m: Object = this.props.liveCatch.get(item.liveId);
    m.child.kill();
  }
  /**
   * 录制
   * 使用Promise进行了包装
   */
  recordingPromise(item): Promise{
    return new Promise((resolve: Function, reject: Function): void=>{
      const title: string = '【口袋48直播】' + '_' + item.title +
        '_直播时间_' + time('YY-MM-DD-hh-mm-ss', item.startTime) +
        '_录制时间_' + time('YY-MM-DD-hh-mm-ss') +
        '_' + item.liveId;
      const child: Object = child_process.spawn(`${ __dirname }/dependent/ffmpeg/ffmpeg.exe`, [
          `-i`,
          `${ item.streamPath }`,
          `-c`,
          `copy`,
          `${ __dirname }/output/${ title }.flv`
        ]
      );
      child.stdout.on('data', child_process_stdout);
      child.stderr.on('data', child_process_stderr);
      child.on('close', child_process_exit);
      child.on('error', child_process_error);

      this.props.liveCatch.set(item.liveId, {
        child: child,
        item: item,
      });
      resolve();
    });
  }
  // 自动录制的进程
  async autoRecordingProcess(humans: string[]): void{
    this.setState({
      loading: true
    });
    // 获取列表
    const data: string = await post(0);
    const data2: Object = JSON.parse(data);
    if(data2.status === 200){
      message.success('请求成功');
      const liveList: Array = 'liveList' in data2.content ? data2.content.liveList : [];

      // 获取列表成功后开始构建录制进程
      const queue: Array = [];                                                // Promise.all进程
      const humanRegExp: RegExp = new RegExp(`(${ humans.join('|') })`, 'i');  // 正则
      liveList.map((item: Object, index: number): void=>{
        // 用正则表达式判断指定的成员
        if(humanRegExp.test(item.title)){
          // 有录制的进程
          if(this.props.liveCatch.has(item.liveId)){
            const m: Object = this.props.liveCatch.get(item.liveId);
            // 录制由于特殊原因已经结束，如断线等
            if(m.child.exitCode !== null){
              queue.push(this.recordingPromise(item));
            }
            // 没有录制进程
          }else{
            queue.push(this.recordingPromise(item));
          }
        }
      });

      // 启动所有的录制进程
      await Promise.all(queue);
      this.props.action.liveChange({
        map: this.props.liveCatch,
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
  async onAutoRecording(event: Object): void{
    const data: Object = await this.props.action.getAutoRecordingOption({
      data: 'liveCatchOption'
    });
    let time: ?number = null,
      humans: ?Array = null;
    if(data){
      [time, humans] = [data.option.time, data.option.humans];
    }else{
      [time, humans] = [1, []];
    }
    this.autoRecordingProcess(humans);
    this.props.action.autoRecording({
      autoRecording: global.setInterval(this.autoRecordingProcess.bind(this), time * 60 * (10 ** 3), humans)
    });
  }
  // 停止自动录制（停止的是定时器，已经录制的不会停止）
  onStopAutoRecording(event: Object): void{
    global.clearInterval(this.props.autoRecording);
    this.props.action.autoRecording({
      autoRecording: null
    });
  }
  // 获取录制列表
  async getLiveList(event: Object): void{
    this.setState({
      loading: true
    });
    const data: string = await post(0);
    const data2: Object = JSON.parse(data);
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
  render(): Object{
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
              <Link to="/LiveCatch/Option">
                <Button disabled={ this.props.autoRecording }>
                  <Icon type="setting" />
                  <span>自动录制配置</span>
                </Button>
              </Link>
            </div>
            <div className={ publicStyle.fr }>
              <Button className={ publicStyle.ml10 } onClick={ this.getLiveList.bind(this) }>
                <Icon type="loading-3-quarters" />
                <span>刷新列表</span>
              </Button>
              <Link to="/">
                <Button className={ publicStyle.ml10 } type="danger">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Button>
              </Link>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div className={ publicStyle.tableBox }>
          <Table loading={ this.state.loading }
                 bordered={ true }
                 columns={ this.columus() }
                 rowKey={ (item: Object): number=>item.liveId }
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

export default LiveCatch;