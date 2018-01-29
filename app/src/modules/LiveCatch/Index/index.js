/* 口袋48直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Affix, message, Popconfirm } from 'antd';
import { liveList, liveCatch, liveChange, autoRecording } from '../store/index';
import publicStyle from '../../publicMethod/public.sass';
import post from '../../publicMethod/post';
import { time } from '../../../function';
import { getAutoRecordingOption } from '../store/reducer';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
import option from '../../publicMethod/option';
const child_process = global.require('child_process');
const querystring = global.require('querystring');
const gui = global.require('nw.gui');

/* 初始化数据 */
const getIndex: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('liveCatch') ? $$state.get('liveCatch').get('index') : null;

const state: Function = createStructuredSelector({
  liveList: createSelector(         // 当前直播
    getIndex,
    ($$data: ?Immutable.Map): Array => $$data !== null && $$data.has('liveList') ? $$data.get('liveList') : []
  ),
  liveCatch: createSelector(        // 当前直播录制
    getIndex,
    ($$data: ?Immutable.Map): Map => $$data !== null && $$data.has('liveCatch') ? $$data.get('liveCatch') : new Map()
  ),
  autoRecording: createSelector(    // 自动抓取直播定时器
    getIndex,
    ($$data: ?Immutable.Map): ?number => $$data !== null && $$data.has('autoRecording') ? $$data.get('autoRecording') : null
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
  constructor(): void{
    super(...arguments);

    this.state = {
      loading: false       // 表格的加载动画
    };
  }
  // 表格配置
  columus(): Array{
    const columns = [
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
        width: '20%'
      },
      {
        title: '直播地址',
        dataIndex: 'streamPath',
        key: 'streamPath',
        width: '30%'
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
        width: '20%',
        render: (text: any, item: Object): Array=>{
          let btn: Object = null;
          if(this.props.liveCatch.has(text)){
            const m: Object = this.props.liveCatch.get(text);
            if(m.child.exitCode === null){
              btn = (
                <Popconfirm key={ 0 } title="确认停止录制吗？" onConfirm={ this.onStopRecording.bind(this, item) }>
                  <Button type="danger" icon="close-square">停止录制</Button>
                </Popconfirm>
              );
            }else{
              btn = (
                <Button key={ 1 } type="primary" icon="play-circle-o" onClick={ this.onRecording.bind(this, item) }>录制</Button>
              );
            }
          }else{
            btn = (
              <Button key={ 1 } type="primary" icon="play-circle-o" onClick={ this.onRecording.bind(this, item) }>录制</Button>
            );
          }
          return [
            btn,
            <Button key={ 2 } className={ publicStyle.ml10 } icon="video-camera" onClick={ this.onVideoPlay.bind(this, item) }>播放</Button>
          ];
        }
      }
    ];
    return columns;
  }
  // 打开新窗口看直播
  onVideoPlay(item: Object, event: Event): void{
    const qs: Object = {
      title: item.title,
      subTitle: item.subTitle,
      streamPath: item.streamPath
    };
    const u: string = './build/videoPlay.html?' + querystring.stringify(qs);
    gui.Window.open(u, {
      position: 'center',
      width: 400,
      height: 600,
      focus: true,
      title: item.title,
    })
  }
  // 录制视频
  onRecording(item: Object, event: Event): void{
    const title: string = '【口袋48直播】_' + item.liveId + '_' + item.title +
      '_starttime_' + time('YY-MM-DD-hh-mm-ss', item.startTime) +
      '_recordtime_' + time('YY-MM-DD-hh-mm-ss');
    const child: Object = child_process.spawn(option.ffmpeg, [
      `-i`,
      `${ item.streamPath }`,
      `-c`,
      `copy`,
      `${ option.output }/${ title }.flv`
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
  onStopRecording(item: Object, event: Event): void{
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
      const child: Object = child_process.spawn(option.ffmpeg, [
        `-i`,
        `${ item.streamPath }`,
        `-c`,
        `copy`,
        `${ option.output }/${ title }.flv`
      ]);
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
  async autoRecordingProcess(humans: string[]): Promise<void>{
    this.setState({
      loading: true
    });
    // 获取列表
    const _this: Object = this;
    const data: string = await post(0);
    const data2: Object = JSON.parse(data);
    if(data2.status === 200){
      message.success('请求成功');
      const liveList: Array = 'liveList' in data2.content ? data2.content.liveList : [];

      // 获取列表成功后开始构建录制进程
      const queue: Array = [];                                                 // Promise.all进程
      const humanRegExp: RegExp = new RegExp(`(${ humans.join('|') })`, 'i');  // 正则
      for(const item: Object of liveList){
        // 用正则表达式判断指定的成员
        if(humanRegExp.test(item.title)){
          // 有录制的进程
          if(_this.props.liveCatch.has(item.liveId)){
            const m: Object = _this.props.liveCatch.get(item.liveId);
            // 录制由于特殊原因已经结束，如断线等
            if(m.child.exitCode !== null){
              queue.push(_this.recordingPromise(item));
            }
            // 没有录制进程
          }else{
            queue.push(_this.recordingPromise(item));
          }
        }
      }
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
  async onAutoRecording(event: Event): Promise<void>{
    const qr: Object = await this.props.action.getAutoRecordingOption({
      query: 'liveCatchOption'
    });
    const data: Object = qr.result;
    let time: ?number = null,
      humans: ?Array = null;
    if(data){
      [time, humans] = [data.option.time, data.option.humans];
    }
    this.autoRecordingProcess(humans ? humans : []);
    this.props.action.autoRecording({
      autoRecording: global.setInterval(this.autoRecordingProcess.bind(this), (time ? time : 1) * 60 * (10 ** 3), humans ? humans : [])
    });
  }
  // 停止自动录制（停止的是定时器，已经录制的不会停止）
  onStopAutoRecording(event: Event): void{
    global.clearInterval(this.props.autoRecording);
    this.props.action.autoRecording({
      autoRecording: null
    });
  }
  // 获取录制列表
  async onGetLiveList(event: Event): Promise<void>{
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
  render(): Array{
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            {
              this.props.autoRecording ?
                (
                  <Button className={ publicStyle.mr10 } type="danger" icon="close-square" onClick={ this.onStopAutoRecording.bind(this) }>停止自动录制</Button>
                ) :
                (
                  <Button className={ publicStyle.mr10 } type="primary" icon="play-circle" onClick={ this.onAutoRecording.bind(this) }>开始自动录制</Button>
                )
            }
            <Link to="/LiveCatch/Option">
              <Button icon="setting" disabled={ this.props.autoRecording }>自动录制配置</Button>
            </Link>
          </div>
          <div className={ publicStyle.fr }>
            <Button icon="loading-3-quarters" onClick={ this.onGetLiveList.bind(this) }>刷新列表</Button>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ publicStyle.tableBox }>
        <Table loading={ this.state.loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): number => item.liveId }
          dataSource={ this.props.liveList }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </div>
    ];
  }
}

export default LiveCatch;