/* 口袋48直播抓取 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Popconfirm, Tag } from 'antd';
import classNames from 'classnames';
import { liveList, liveCatch, liveChange, autoRecording } from '../reducer/index';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import post, { getLiveInfo } from '../../../components/post/post';
import { time } from '../../../utils';
import { getAutoRecordingOption } from '../reducer/reducer';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
import style from './style.sass';
import option from '../../../components/option/option';
import StreamPath from '../../../components/post/StreamPath';
const child_process = global.require('child_process');
const querystring = global.require('querystring');
const gui = global.require('nw.gui');

/* 初始化数据 */
const getIndex = ($$state) => $$state.has('liveCatch')
  ? $$state.get('liveCatch').get('index') : null;

const state = createStructuredSelector({
  liveList: createSelector( // 当前直播
    getIndex,
    ($$data) => $$data !== null && $$data.has('liveList') ? $$data.get('liveList').toJS() : []
  ),
  liveCatch: createSelector( // 当前直播录制
    getIndex,
    ($$data) => $$data !== null && $$data.has('liveCatch') ? $$data.get('liveCatch') : new Map()
  ),
  autoRecording: createSelector( // 自动抓取直播定时器
    getIndex,
    ($$data) => $$data !== null && $$data.has('autoRecording') ? $$data.get('autoRecording') : null
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    liveList,
    liveCatch,
    liveChange,
    autoRecording,
    getAutoRecordingOption
  }, dispatch)
});

@connect(state, actions)
class Index extends Component {
  static propTypes = {
    liveList: PropTypes.array,
    liveCatch: PropTypes.object,
    autoRecording: PropTypes.number,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor() {
    super(...arguments);

    this.state = {
      loading: false // 表格的加载动画
    };
  }

  // 表格配置
  columus() {
    const columns = [
      {
        title: '直播标题',
        dataIndex: 'title',
        key: 'title',
        width: '20%',
        render: (value, item, index) => {
          const isZhibo = item.liveType === 1;
          const tag = (
            <Tag key="liveType"
              className={ style.tag }
              color={ isZhibo ? '#f50' : '#2db7f5' }
            >
              { isZhibo ? '直播' : '电台' }
            </Tag>
          );

          if (item._end === true) {
            return [tag, <span key="title" className={ style.overdue }>{ value }</span>];
          } else {
            return [tag, value];
          }
        }
      },
      {
        title: '直播地址',
        dataIndex: 'liveId',
        key: 'liveId',
        width: '30%',
        render: (value, item, index) => {
          const isZhibo = item.liveType === 1;

          return <StreamPath key="streamPath" liveId={ value } isZhibo={ isZhibo } />;
        }
      },
      {
        title: '直播人',
        dataIndex: 'userInfo.nickname',
        key: 'userInfo.nickname',
        width: '10%',
        render: (value, item, index) => {
          if (item._end === true) {
            return <span className={ style.overdue }>{ value }</span>;
          } else {
            return value;
          }
        }
      },
      {
        title: '开始时间',
        dataIndex: 'ctime',
        key: 'ctime',
        width: '15%',
        render: (value, item, index) => {
          const t = time('YY-MM-DD hh:mm:ss', Number(value));

          if (item._end === true) {
            return <span className={ style.overdue }>{ t }</span>;
          } else {
            return t;
          }
        }
      },
      {
        title: '操作',
        dataIndex: 'liveId',
        key: 'handle',
        width: '25%',
        render: (value, item, index) => {
          let btn = null;

          if (this.props.liveCatch.has(value)) {
            const m = this.props.liveCatch.get(value);

            if (m && m.child.exitCode === null) {
              btn = (
                <Popconfirm key="stop" title="确认停止录制吗？" onConfirm={ this.handleStopRecordingClick.bind(this, item) }>
                  <Button type="danger" icon="close-square">停止录制</Button>
                </Popconfirm>
              );
            } else {
              btn = (
                <Button key="record"
                  type="primary"
                  icon="play-circle-o"
                  onClick={ this.handleRecordingClick.bind(this, item) }
                >
                  录制
                </Button>
              );
            }
          } else {
            btn = (
              <Button key="record"
                type="primary"
                icon="play-circle-o"
                onClick={ this.handleRecordingClick.bind(this, item) }
              >
                录制
              </Button>
            );
          }

          return [
            btn,
            <Button key="camera"
              className={ publicStyle.ml10 }
              icon="video-camera"
              onClick={ this.handleVideoPlayClick.bind(this, item) }
            >
              播放
            </Button>
          ];
        }
      }
    ];

    return columns;
  }

  // 打开新窗口看直播
  async handleVideoPlayClick(item, event) {
    const liveInfo = await getLiveInfo(item.liveId);

    if (liveInfo.status === 200) {
      const qs = {
        title: item.title,
        nickname: item.userInfo.nickname,
        streamPath: liveInfo.content.playStreamPath,
        liveType: item.liveType
      };

      const u = './build/videoPlay.html?' + querystring.stringify(qs);

      gui.Window.open(u, {
        position: 'center',
        width: 400,
        height: 600,
        focus: true,
        title: item.title
      });
    } else {
      message.warn('直播不存在！');
    }
  }

  // 录制视频
  async handleRecordingClick(item, event) {
    const isZhibo = item.liveType === 1;
    const title = `【口袋48${ isZhibo ? '直播' : '电台' }】_${ item.userInfo.nickname }`
      + `_直播时间_${ time('YY-MM-DD-hh-mm-ss', Number(item.ctime)) }`
      + `_录制时间_${ time('YY-MM-DD-hh-mm-ss') }_${ item.liveId }`;
    const liveInfo = await getLiveInfo(item.liveId);

    if (liveInfo.status === 200) {
      const child = child_process.spawn(option.ffmpeg, [
        '-i',
        liveInfo.content.playStreamPath,
        '-c',
        'copy',
        `${ option.output }/${ title }.flv`
      ]);

      const { liveCatch, liveList } = this.props;

      child.stdout.on('data', child_process_stdout);
      child.stderr.on('data', child_process_stderr);
      child.on('close', child_process_exit);
      child.on('error', child_process_error);

      liveCatch.set(item.liveId, { child, item });

      this.props.action.liveChange({
        map: liveCatch,
        liveList
      });
    }
  }

  // 停止录制视频
  handleStopRecordingClick(item, event) {
    const m = this.props.liveCatch.get(item.liveId);

    m.child.kill();
  }

  /**
   * 录制
   * 使用Promise进行了包装
   */
  async recordingPromise(item) {
    const isZhibo = item.liveType === 1;
    const title = `【口袋48${ isZhibo ? '直播' : '电台' }】_${ item.userInfo.nickname }`
      + `_直播时间_${ time('YY-MM-DD-hh-mm-ss', Number(item.ctime)) }`
      + `_录制时间_${ time('YY-MM-DD-hh-mm-ss') }_${ item.liveId }`;
    const liveInfo = await getLiveInfo(item.liveId);

    if (liveInfo.status === 200) {
      const child = child_process.spawn(option.ffmpeg, [
        '-i',
        `${ liveInfo.content.playStreamPath }`,
        '-c',
        'copy',
        `${ option.output }/${ title }.flv`
      ]);

      child.stdout.on('data', child_process_stdout);
      child.stderr.on('data', child_process_stderr);
      child.on('close', child_process_exit);
      child.on('error', child_process_error);

      this.props.liveCatch.set(item.liveId, { child, item });
    }
  }

  // 自动录制的进程
  async autoRecordingProcess(humans) {
    this.setState({
      loading: true
    });

    // 获取列表
    const _this = this;
    const data = await post(0, true);

    if (data.status === 200) {
      message.success('请求成功');
      const liveList = 'liveList' in data.content ? data.content.liveList : [];

      // 获取列表成功后开始构建录制进程
      const queue = []; // Promise.all进程
      const humanRegExp = new RegExp(`(${ humans.join('|') })`, 'i'); // 正则

      for (const item of liveList) {
        const { userId, nickname } = item.userInfo;

        // 用正则表达式判断指定的成员
        if (humanRegExp.test(nickname) || humans.includes[userId]) {
          if (_this.props.liveCatch.has(item.liveId)) {
            // 有录制的进程
            const m = _this.props.liveCatch.get(item.liveId);

            if (m.child.exitCode !== null) queue.push(_this.recordingPromise(item)); // 录制由于特殊原因已经结束，如断线等
          } else {
            // 没有录制进程
            queue.push(_this.recordingPromise(item));
          }
        }
      }

      // 启动所有的录制进程
      await Promise.all(queue);
      this.props.action.liveChange({
        map: this.props.liveCatch,
        liveList
      });
    } else {
      message.error('请求失败');
    }
    this.setState({
      loading: false
    });
  }

  // 自动录制
  async handleAutoRecordingClick(event) {
    const qr = await this.props.action.getAutoRecordingOption({
      query: 'liveCatchOption'
    });
    const data = qr.result;
    let time = null,
      humans = null;

    if (data) {
      [time, humans] = [data.option.time, data.option.humans];
    }

    this.autoRecordingProcess(humans ? humans : []);
    this.props.action.autoRecording({
      autoRecording: global.setInterval(
        this.autoRecordingProcess.bind(this),
        (time ? time : 1) * 60 * (10 ** 3),
        humans ? humans : []
      )
    });
  }

  // 停止自动录制（停止的是定时器，已经录制的不会停止）
  handleStopAutoRecordingClick(event) {
    global.clearInterval(this.props.autoRecording);
    this.props.action.autoRecording({
      autoRecording: null
    });
  }

  // 获取录制列表
  async handleGetLiveListClick(event) {
    this.setState({
      loading: true
    });
    const data = await post(0, true);

    if (data.status === 200) {
      message.success('请求成功');
      this.props.action.liveList({
        liveList: 'liveList' in data.content ? data.content.liveList : []
      });
    } else {
      message.error('请求失败');
    }
    this.setState({
      loading: false
    });
  }

  render() {
    return (
      <Fragment>
        {/* 功能区 */}
        <Affix key="affix" className={ publicStyle.affix }>
          <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
            <div className={ publicStyle.fl }>
              {
                this.props.autoRecording
                  ? (
                    <Button className={ publicStyle.mr10 }
                      type="danger"
                      icon="close-square"
                      onClick={ this.handleStopAutoRecordingClick.bind(this) }
                    >
                      停止自动录制
                    </Button>
                  ) : (
                    <Button className={ publicStyle.mr10 }
                      type="primary"
                      icon="play-circle"
                      onClick={ this.handleAutoRecordingClick.bind(this) }
                    >
                      开始自动录制
                    </Button>
                  )
              }
              <Link className={ publicStyle.mr10 } to="/LiveCatch/Option">
                <Button icon="setting" disabled={ this.props.autoRecording }>自动录制配置</Button>
              </Link>
              <p className={ style.tishi }>
                友情提示：为了小偶像着想，避免留下黑历史，请在录制完直播后审核一下再上传，避免出现不文明、色情、政治等相关内容，被人抓住把柄。
                <br />
                在录制直播过程中，如果发现录的视频没有声音和画面，那么说明直播有问题，无法使用ffmpeg下载。
              </p>
            </div>
            <div className={ publicStyle.fr }>
              <Button icon="loading-3-quarters" onClick={ this.handleGetLiveListClick.bind(this) }>刷新列表</Button>
              <Link className={ publicStyle.ml10 } to="/">
                <Button type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div key="tableBox" className={ publicStyle.tableBox }>
          <Table loading={ this.state.loading }
            bordered={ true }
            columns={ this.columus() }
            rowKey={ (item) => item.liveId }
            dataSource={ this.props.liveList }
            pagination={{
              pageSize: 20,
              showQuickJumper: true
            }}
          />
        </div>
      </Fragment>
    );
  }
}

export default Index;