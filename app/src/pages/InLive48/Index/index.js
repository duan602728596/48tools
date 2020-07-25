/* 直播抓取 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Affix, Button, Select, Table, message, Popconfirm } from 'antd';
import classNames from 'classnames';
import $ from 'jquery';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import option from '../../../components/option/option';
import style from './style.sass';
import { inLiveList } from '../reducer/reducer';
import { time } from '../../../utils';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
const child_process = global.require('child_process');
const cheerio = global.require('cheerio');
const request = global.require('request');

const IN_LIVE_URL = {
  SNH48: 'https://live.48.cn/Index/main/club/1',
  BEJ48: 'https://live.48.cn/Index/main/club/2',
  GNZ48: 'https://live.48.cn/Index/main/club/3',
  SHY48: 'https://live.48.cn/Index/main/club/4',
  CKG48: 'https://live.48.cn/Index/main/club/5'
};

let browser = null;

function randomString(len = 32) {
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz012345678_@';
  const maxPos = $chars.length;
  let pwd = '';

  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }

  return `liveweb${ pwd }`;
}

/* 初始化数据 */
const state = createStructuredSelector({
  inLiveList: createSelector( // 当前查询列表
    ($$state) => $$state.has('inLive48') ? $$state.get('inLive48') : null,
    ($$data) => $$data !== null ? $$data.get('inLiveList').toJS() : []
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    inLiveList
  }, dispatch)
});

@connect(state, actions)
class Index extends Component {
  static propTypes = {
    inLiveList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor() {
    super(...arguments);

    this.state = {
      group: 'SNH48',
      quality: 'gao_url'
    };
  }

  // 表格配置
  columus() {
    const columus = [
      {
        title: '团名称',
        dataIndex: 'group',
        key: 'group',
        width: '25%'
      },
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        width: '25%'
      },
      {
        title: '视频质量',
        dataIndex: 'quality',
        key: 'quality',
        width: '25%'
      },
      {
        title: '操作',
        key: 'handle',
        width: '25%',
        render: (value, item, index) => {
          return [
            item.child.killed === false && item.child.exitCode === null
              ? [
                <Button key="stop"
                  type="danger"
                  icon="close-square"
                  onClick={ this.handleStopClick.bind(this, item) }
                >
                  取消下载
                </Button>
              ] : [
                <b key="isStop" className={ publicStyle.mr10 }>已停止</b>,
                <Popconfirm key="delete" title="确定要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, item) }>
                  <Button type="danger" icon="delete">删除</Button>
                </Popconfirm>
              ]
          ];
        }
      }
    ];

    return columus;
  }

  // select选择
  handleSelect(key, value, option) {
    this.setState({
      [key]: value
    });
  }

  // 获取页面信息
  getHtml(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        type: 'GET',
        cache: true,
        dataType: 'text',
        success(data, status, xhr) {
          resolve(data);
        },
        error(xhr, err) {
          reject(err);
        }
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  // 获取直播间地址（新的直播间地址，其他地方使用旧的直播间地址）
  getInliveUrl() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: IN_LIVE_URL[this.state.group],
        type: 'GET',
        cache: true,
        dataType: 'text',
        success(data, status, xhr) {
          const xml = cheerio.load(data);

          resolve(xml('.v-img a').attr('href'));
        },
        error(xhr, err) {
          reject(err);
        }
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  // 获取地址
  getStreamInfo(param, videoId, suid, id) {
    if (browser === null) {
      browser = randomString(8);
    }

    return new Promise((resolve, reject) => {
      request({
        uri: 'https://live.48.cn/Index/get_streaminfo',
        method: 'POST',
        json: true,
        headers: {
          Host: 'live.48.cn',
          Referer: `https://live.48.cn/Index/inlive/id/${ id }`,
          Origin: 'https://live.48.cn',
          Cookie: `browser=${ browser }`
        },
        form: { param, video_id: videoId, suid, id },
        timeout: 5000
      }, (err, res, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // 点击录制事件
  async handleDownLoadLiveClick(event) {
    const inliveUrl = await this.getInliveUrl();
    const html = await this.getHtml(`https://live.48.cn${ inliveUrl }`);
    const xml = cheerio.load(html);
    const title = `【官方源】${ this.state.group }_${ time('YY.MM.DD_hh.mm.ss') }`;
    const urlInput = xml(`#${ this.state.quality }`);

    if (urlInput.length === 0) {
      message.warn('直播未开始！');

      return false;
    }

    // 添加的验证信息
    const param = xml('#param').val();
    const videoId = xml('#vedio_id').val();
    const suid = xml('#suid').val();
    const id = xml('#id').val();
    const data = await this.getStreamInfo(param, videoId, suid, id);

    const child = child_process.spawn(option.ffmpeg, [
      '-i',
      `${ data.url }`,
      '-c',
      'copy',
      `${ option.output }/${ title }.flv`
    ]);

    child.stdout.on('data', child_process_stdout);
    child.stderr.on('data', child_process_stderr);
    child.on('close', child_process_exit);
    child.on('error', child_process_error);

    const ils = this.props.inLiveList;

    ils.push({
      child,
      title,
      group: this.state.group,
      quality: this.state.quality === 'chao_url' ? '超清' : (
        this.state.quality === 'gao_url' ? '高清' : '流畅'
      )
    });
    this.props.action.inLiveList({
      inLiveList: ils
    });
  }

  // 停止下载
  handleStopClick(item, event) {
    item.child.kill();
  }

  // 删除
  handleDeleteClick(item, event) {
    const index = this.props.inLiveList.indexOf(item);
    const ils = this.props.inLiveList;

    ils.splice(index, 1);
    this.props.action.inLiveList({
      inLiveList: ils
    });
  }

  render() {
    return (
      <Fragment>
        {/* 功能区 */}
        <Affix className={ publicStyle.affix }>
          <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
            <div className={ publicStyle.fl }>
              <Select className={ style.select }
                value={ this.state.group }
                dropdownMatchSelectWidth={ true }
                dropdownClassName={ style.select }
                onSelect={ this.handleSelect.bind(this, 'group') }
              >
                <Select.Option key="SNH48" value="SNH48">SNH48</Select.Option>
                <Select.Option key="BEJ48" value="BEJ48">BEJ48</Select.Option>
                <Select.Option key="GNZ48" value="GNZ48">GNZ48</Select.Option>
                <Select.Option key="SHY48" value="SHY48">SHY48</Select.Option>
                <Select.Option key="CKG48" value="CKG48">CKG48</Select.Option>
              </Select>
              <Select className={ style.select }
                value={ this.state.quality }
                dropdownMatchSelectWidth={ true }
                dropdownClassName={ style.select }
                onSelect={ this.handleSelect.bind(this, 'quality') }
              >
                <Select.Option key="gao_url" value="gao_url">高清</Select.Option>
                <Select.Option key="chao_url" value="chao_url">超清</Select.Option>
                <Select.Option key="liuchang_url" value="liuchang_url">流畅</Select.Option>
              </Select>
              <Button type="primary" icon="cloud-download" onClick={ this.handleDownLoadLiveClick.bind(this) }>录制官方源</Button>
            </div>
            <div className={ publicStyle.fr }>
              <Link to="/">
                <Button type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
        {/* 录制列表 */}
        <Table className={ publicStyle.tableBox }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item) => item.title }
          dataSource={ this.props.inLiveList }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </Fragment>
    );
  }
}

export default Index;