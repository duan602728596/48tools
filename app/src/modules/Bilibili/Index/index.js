/* B站直播抓取 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Popconfirm } from 'antd';
import classNames from 'classnames';
import { cursorBilibiliLiveRoom, deleteBilibiliLiveRoom, catching } from '../reducer/index';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import getUrl from './getUrl';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
import { time } from '../../../utils';
import option from '../../../components/option/option';
const child_process = global.require('child_process');

/* 初始化数据 */
const getIndex = ($$state) => $$state.has('bilibili')
  ? $$state.get('bilibili').get('index') : null;

const state = createStructuredSelector({
  liveList: createSelector( // 直播间信息
    getIndex,
    ($$data) => $$data !== null && $$data.has('liveList') ? $$data.get('liveList').toJS() : []
  ),
  catching: createSelector( // 正在直播
    getIndex,
    ($$data) => $$data !== null && $$data.has('catching') ? $$data.get('catching') : new Map()
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    cursorBilibiliLiveRoom,
    deleteBilibiliLiveRoom,
    catching
  }, dispatch)
});

@connect(state, actions)
class Index extends Component {
  static propTypes = {
    liveList: PropTypes.array,
    catching: PropTypes.object,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor() {
    super(...arguments);

    this.state = {
      loading: true // 加载动画
    };
  }

  // 表格配置
  columus() {
    const columns = [
      {
        title: '直播间名称',
        dataIndex: 'roomname',
        key: 'roomname',
        width: '32%'
      },
      {
        title: '直播间ID',
        dataIndex: 'roomid',
        key: 'roomid',
        width: '32%'
      },
      {
        title: '操作',
        key: 'handle',
        width: '36%',
        render: (value, item, index) => {
          return [
            this.props.catching.has(item.roomid)
              ? (
                <Popconfirm key="catchStop" title="确认停止录制吗？" onConfirm={ this.handleCatchStopClick.bind(this, item) }>
                  <Button className={ classNames(publicStyle.ml10, publicStyle.btn) } type="primary" icon="minus-circle">停止</Button>
                </Popconfirm>
              ) : (
                <Button key="catch"
                  className={ classNames(publicStyle.ml10, publicStyle.btn) }
                  type="primary"
                  icon="laptop"
                  onClick={ this.handleCatchClick.bind(this, item) }
                >
                  录制
                </Button>
              ),
            <Popconfirm key="delete" title="确定要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, item) }>
              <Button className={ publicStyle.ml10 }
                type="danger"
                icon="close-square"
                disabled={ this.props.catching.has(item.roomid) }
              >
                删除
              </Button>
            </Popconfirm>
          ];
        }
      }
    ];

    return columns;
  }

  async componentDidMount() {
    await this.props.action.cursorBilibiliLiveRoom({
      query: {
        indexName: 'roomname'
      }
    });
    this.setState({
      loading: false
    });
  }

  // 录制
  async handleCatchClick(item, event) {
    const url = await getUrl(item.roomid);
    const urlList = JSON.parse(url);
    const title = `【B站直播抓取】_${ item.roomname }_${ item.roomid }_${ time('YY-MM-DD-hh-mm-ss') }`;
    const child = child_process.spawn(option.ffmpeg, [
      '-i',
      `${ urlList.durl[0].url }`,
      '-c',
      'copy',
      `${ option.output }/${ title }.flv`
    ]);

    child.stdout.on('data', child_process_stdout);
    child.stderr.on('data', child_process_stderr);
    child.on('close', child_process_exit);
    child.on('error', child_process_error);

    this.props.catching.set(item.roomid, {
      child,
      item
    });
    this.props.action.catching({
      catching: this.props.catching,
      liveList: this.props.liveList.slice()
    });
    message.success(`开始录制【${ item.roomname }】！`);
  }

  // 停止
  handleCatchStopClick(item, event) {
    const m = this.props.catching.get(item.roomid);

    m.child.kill();
    message.warn(`停止录制【${ item.roomname }】！`);
  }

  // 删除
  async handleDeleteClick(item, event) {
    try {
      await this.props.action.deleteBilibiliLiveRoom({
        query: item.roomid
      });
      message.success('删除成功！');
    } catch (err) {
      message.error('删除失败！');
    }
  }

  render() {
    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
          <div className={ publicStyle.fl }>
            <Link to="/BiliBili/Option">
              <Button type="primary" icon="setting">添加B站直播间</Button>
            </Link>
          </div>
          <div className={ publicStyle.fr }>
            <Link to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key="tableBox" className={ publicStyle.tableBox }>
        <Table loading={ this.state.loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item) => item.roomid }
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

export default Index;