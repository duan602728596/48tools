/* 口袋48录播下载 */
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Affix, message, Input, Tag, Popconfirm } from 'antd';
import classNames from 'classnames';
import { downloadList, playBackList } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import post, { getLiveInfo } from '../../../components/post/post';
import { time } from '../../../utils';
import StreamPath from '../../../components/post/StreamPath';
import { child_process_error, child_process_exit, child_process_stderr, child_process_stdout } from './child_process';
import option from '../../../components/option/option';
const child_process = global.require('child_process');
const fs = global.require('fs');
const url = global.require('url');
const request = global.require('request');

/**
 * 搜索的过滤函数
 * @param { Array } array   : 需要过滤的数组
 * @param { RegExp } keyword: 关键字的正则表达式
 * @param { number } from   : 查找范围
 * @param { number } to     : 查找范围
 * @return { Array }
 */
function filter(array, keyword, from, to) {
  // 如果没有搜索字符串，返回所有数组
  if (!keyword || array.length === 0) {
    return array;
  }
  // 判断当前是否满足搜索匹配
  if (from === to) {
    return keyword.test(array[from].userInfo.nickname) ? [array[from]] : [];
  }
  // 拆分数组
  const middle = Math.floor((to - from) / 2) + from;
  const left = filter(array, keyword, from, middle);
  const right = filter(array, keyword, middle + 1, to);

  return left.concat(right);
}

/* 初始化数据 */
const getState = ($$state) => $$state.has('playBackDownload')
  ? $$state.get('playBackDownload') : null;

const state = createStructuredSelector({
  playBackList: createSelector( // 当前录播
    getState,
    ($$data) => $$data !== null && $$data.has('playBackList') ? $$data.get('playBackList').toJS() : []
  ),
  giftUpdTime: createSelector( // 加载时间戳
    getState,
    ($$data) => $$data !== null && $$data.has('giftUpdTime') ? $$data.get('giftUpdTime') : 0
  ),
  downloadList: createSelector( // 下载列表
    getState,
    ($$data) => $$data !== null ? $$data.get('downloadList') : new Map()
  )
});

/* dispatch */
const dispatch = (dispatch) => ({
  action: bindActionCreators({
    playBackList,
    downloadList
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Index extends Component {
  static propTypes = {
    playBackList: PropTypes.array,
    giftUpdTime: PropTypes.number,
    downloadList: PropTypes.object,
    fnReady: PropTypes.bool,
    action: PropTypes.objectOf(PropTypes.func),
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  };
  playBackDownloadSearchInput = createRef();

  constructor() {
    super(...arguments);

    this.state = {
      loading: false, // 加载动画
      keyword: '', // 搜索关键字
      current: this?.props?.location?.query?.current || 1 // 分页
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

          return [
            <Tag key="liveType" className={ style.tag } color={ isZhibo ? '#f50' : '#2db7f5' }>
              { isZhibo ? '直播' : '电台' }
            </Tag>,
            value
          ];
        }
      },
      {
        title: '直播地址',
        dataIndex: 'liveId',
        key: 'liveId',
        width: '35%',
        render: (value, item, index) => {
          const isZhibo = item.liveType === 1;

          return <StreamPath key="streamPath" liveId={ value } isZhibo={ isZhibo } />;
        }
      },
      {
        title: '直播人',
        dataIndex: 'userInfo.nickname',
        key: 'userInfo.nickname',
        width: '15%'
      },
      {
        title: '开始时间',
        dataIndex: 'ctime',
        key: 'ctime',
        width: '15%',
        render: (value, item) => time('YY-MM-DD hh:mm:ss', Number(value))
      },
      {
        title: '操作',
        dataIndex: 'liveId',
        key: 'handle',
        width: '15%',
        render: (value, item, index) => {
          const m = this.props.downloadList.get(value);

          if (m && m.child.exitCode === null) {
            return (
              <Popconfirm key="stop" title="确认停止下载吗？" onConfirm={ this.handleStopRecordingClick.bind(this, item) }>
                <Button type="danger" icon="close-square">停止下载</Button>
              </Popconfirm>
            );
          } else {
            return (
              <Button key="download"
                icon="fork"
                onClick={ this.handleDownloadClick.bind(this, item) }
              >
                下载
              </Button>
            );
          }
        }
      }
    ];

    return columns;
  }

  // 停止录制视频
  handleStopRecordingClick(item, event) {
    const m = this.props.downloadList.get(item.liveId);

    m.child.kill();
  }

  // 分页变化
  handlePageChange(page, pageSize) {
    this.setState({
      current: page
    });
  }

  // 格式化m3u8中的ts地址
  formatTsUrl(data) {
    const strArr = data.split('\n');
    const newStrArr = [];

    for (const item of strArr) {
      if (!/^#/.test(item)) {
        const { pathname } = url.parse(item);

        if (/\.ts$/.test(pathname)) {
          newStrArr.push(`http://cychengyuan-vod.48.cn${ item }`);
        } else {
          newStrArr.push(item);
        }
      } else {
        newStrArr.push(item);
      }
    }

    return newStrArr.join('\n');
  }

  // 下载m3u8文件
  downloadM3u8(m3u8, title) {
    return new Promise((resolve, reject) => {
      request({
        uri: m3u8
      }, (err, res, data) => {
        if (err) {
          reject(err);
        } else {
          const downloadFile = `${ option.output }/${ title }.m3u8`;

          fs.writeFile(downloadFile, this.formatTsUrl(data.toString()), (err2) => {
            if (err2) {
              reject(err2);
            } else {
              resolve(downloadFile);
            }
          });
        }
      });
    });
  }

  // 下载
  async handleDownloadClick(item, event) {
    try {
      const title = '【口袋48录播】' + '_' + item.title
        + '_直播时间_' + time('YY-MM-DD-hh-mm-ss', Number(item.ctime))
        + '_下载时间_' + time('YY-MM-DD-hh-mm-ss')
        + '_' + item.liveId;
      const liveInfo = await getLiveInfo(item.liveId);

      if (liveInfo.status === 200) {
        const m3u8 = await this.downloadM3u8(liveInfo.content.playStreamPath, title);
        const child = child_process.spawn(option.ffmpeg, [
          '-protocol_whitelist',
          'file,http,https,tcp,tls',
          '-i',
          `${ m3u8 }`,
          '-c',
          'copy',
          '-f',
          'mp4',
          `${ option.output }/${ title }.mp4`
        ]);
        const { playBackList, giftUpdTime, downloadList } = this.props;

        child.stdout.on('data', child_process_stdout);
        child.stderr.on('data', child_process_stderr);
        child.on('close', child_process_exit);
        child.on('error', child_process_error);

        downloadList.set(item.liveId, { child, item });
        this.props.action.playBackList({
          giftUpdTime,
          playBackList
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 搜索事件（点击按钮 + input回车）
  handleSearchInputClick(event) {
    const { value } = this.playBackDownloadSearchInput.current.input;
    let reg = null;

    if (!/^\s*$/.test(value)) {
      const str = value.split(/\s+/);

      for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] === '') str.splice(i, 1);
      }
      reg = new RegExp(`(${ str.join('|') })`, 'i');
    }

    this.setState({
      keyword: reg
    });
  }

  // 重置
  handleResetClick(event) {
    this.setState({
      keyword: ''
    });
  }

  // 加载和刷新列表
  async handlePlayBackListLoadClick(type, event) {
    this.setState({
      loading: true
    });
    // 判断是加载还是刷新
    let pl = null;
    let giftUpdTime = null;

    switch (type) {
      case '加载':
        pl = this.props.playBackList;
        giftUpdTime = this.props.giftUpdTime;
        break;

      case '刷新':
        pl = [];
        giftUpdTime = 0;
        break;
    }

    // 获取数据
    const data = await post(giftUpdTime);

    // 更新列表
    this.props.action.playBackList({
      playBackList: pl.concat(data.content.liveList),
      giftUpdTime: Number(data.content.next)
    });

    this.setState({
      loading: false
    });

    message.success('录播加载成功！');
  }
  render() {
    const { playBackList } = this.props;
    const { loading, keyword } = this.state;

    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
          <div className={ publicStyle.fl }>
            <label className={ publicStyle.mr10 } htmlFor="playBackDownload-searchInput">搜索已加载列表：</label>
            <Input ref={ this.playBackDownloadSearchInput }
              className={ style.searchInput }
              id="playBackDownload-searchInput"
              placeholder="多个关键字用空格分割"
              onPressEnter={ this.handleSearchInputClick.bind(this) }
            />
            <Button className={ publicStyle.mr10 } icon="search" onClick={ this.handleSearchInputClick.bind(this) }>搜索</Button>
            <Button icon="close" onClick={ this.handleResetClick.bind(this) }>重置</Button>
            <p className={ style.tishi }>
              如果下载后的视频出现播放不出来的情况，请换个播放器试试。
              <br />
              如果出现下载卡死的情况，说明视频源有问题。
            </p>
          </div>
          <div className={ publicStyle.fr }>
            <Button type="primary"
              icon="cloud-download-o"
              onClick={ this.handlePlayBackListLoadClick.bind(this, '加载') }
            >
              加载列表
            </Button>
            <Button className={ publicStyle.ml10 }
              icon="loading-3-quarters"
              onClick={ this.handlePlayBackListLoadClick.bind(this, '刷新') }
            >
              刷新列表
            </Button>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key="tableBox" className={ publicStyle.tableBox }>
        <Table loading={ loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item) => item.liveId }
          dataSource={ filter(playBackList, keyword, 0, playBackList.length - 1) }
          pagination={{
            pageSize: 20,
            showQuickJumper: true,
            current: this.state.current,
            onChange: this.handlePageChange.bind(this)
          }}
        />
      </div>
    ];
  }
}

export default Index;