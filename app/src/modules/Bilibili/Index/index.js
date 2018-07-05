/* B站直播抓取 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Popconfirm } from 'antd';
import { cursorBilibiliLiveRoom, deleteBilibiliLiveRoom, catching } from '../store/index';
import publicStyle from '../../publicMethod/public.sass';
import getUrl from './getUrl';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
import { time } from '../../../function';
import option from '../../publicMethod/option';
const child_process: Object = global.require('child_process');
const http: Object = global.require('http');

/* 初始化数据 */
const getIndex: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('bilibili')
  ? $$state.get('bilibili').get('index') : null;

const state: Function = createStructuredSelector({
  liveList: createSelector(  // 直播间信息
    getIndex,
    ($$data: ?Immutable.Map): Array => $$data !== null && $$data.has('liveList') ? $$data.get('liveList').toJS() : []
  ),
  catching: createSelector(  // 正在直播
    getIndex,
    ($$data: ?Immutable.Map): Map => $$data !== null && $$data.has('catching') ? $$data.get('catching') : new Map()
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    cursorBilibiliLiveRoom,
    deleteBilibiliLiveRoom,
    catching
  }, dispatch)
});

@connect(state, dispatch)
class BiliBili extends Component{
  state: {
    loading: boolean
  };

  static propTypes: Object = {
    liveList: PropTypes.array,
    catching: PropTypes.object,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor(): void{
    super(...arguments);

    this.state = {
      loading: true     // 加载动画
    };
  }
  // 表格配置
  columus(): Array{
    const columns: Array = [
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
        render: (text: any, item: Object, index: number): React.ChildrenArray<React.Element>=>{
          return [
            this.props.catching.has(item.roomid)
              ? (
                <Popconfirm key="catchStop" title="确认停止录制吗？" onConfirm={ this.onCatchStop.bind(this, item) }>
                  <Button className={ `${ publicStyle.ml10 } ${ publicStyle.btn }` } type="primary" icon="minus-circle">停止</Button>
                </Popconfirm>
              ) : (
                <Button key="catch"
                  className={ `${ publicStyle.ml10 } ${ publicStyle.btn }` }
                  type="primary"
                  icon="step-forward"
                  onClick={ this.onCatch.bind(this, item) }
                >
                  录制
                </Button>
              ),
            <Popconfirm key="delete" title="确定要删除吗？" onConfirm={ this.onDelete.bind(this, item) }>
              <Button className={ publicStyle.ml10 } type="danger" icon="close-square" disabled={ this.props.catching.has(item.roomid) }>删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];
    return columns;
  }
  async UNSAFE_componentWillMount(): Promise<void>{
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
  async onCatch(item: Object, event: Event): Promise<void>{
    const url: string = await getUrl(item.roomid);
    const urlList: Object = JSON.parse(url);
    const title: string = `【B站直播抓取】_${ item.roomname }_${ item.roomid }_${ time('YY-MM-DD-hh-mm-ss') }`;
    const child: Object = child_process.spawn(option.ffmpeg, [
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
  onCatchStop(item: Object, event: Event): void{
    const m: Object = this.props.catching.get(item.roomid);
    m.child.kill();
    message.warn(`停止录制【${ item.roomname }】！`);
  }
  // 删除
  async onDelete(item: Object, event: Event): Promise<void>{
    try{
      await this.props.action.deleteBilibiliLiveRoom({
        query: item.roomid
      });
      message.success('删除成功！');
    }catch(err){
      message.error('删除失败！');
    }
  }
  render(): React.ChildrenArray<React.Element>{
    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
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
          rowKey={ (item: Object): number => item.roomid }
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

export default BiliBili;