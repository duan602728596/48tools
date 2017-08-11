/* B站直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Icon, Affix, message, Popconfirm } from 'antd';
import { cursorBilibiliLiveRoom, deleteBilibiliLiveRoom, catching } from '../store/index';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import getUrl from './getUrl';
import store from '../../../store/store';
import { time } from '../../../function';
const child_process = global.require('child_process');
const path = global.require('path');
const process = global.require('process');
const http = global.require('http');
const __dirname = path.dirname(process.execPath).replace(/\\/g, '/');

/* 初始化数据 */
const getIndex = (state)=>state.get('bilibili').get('index');

const state = createStructuredSelector({
  liveList: createSelector(            // 直播间信息
    getIndex,
    (data)=>data.has('liveList') ? data.get('liveList') : []
  ),
  catching: createSelector(  // 正在直播
    getIndex,
    (data)=>data.has('catching') ? data.get('catching') : new Map()
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    cursorBilibiliLiveRoom,
    deleteBilibiliLiveRoom,
    catching
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class BiliBili extends Component{
  constructor(props) {
    super(props);

    this.state = {
      loading: true,     // 加载动画
    };
  }
  // 表格配置
  columus(){
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
        render: (text, item)=>{
          return (
            <div>
              {
                this.props.catching.has(item.roomid) ?
                  (
                    <Button className={ `${ publicStyle.ml10 } ${ publicStyle.btn }` }
                            type="primary"
                            onClick={ this.onCatchStop.bind(this, item) }>
                      <Icon type="minus-circle"/>
                      <span>停止</span>
                    </Button>
                  ) : (
                  <Button className={ `${ publicStyle.ml10 } ${ publicStyle.btn }` }
                          type="primary"
                          onClick={ this.onCatch.bind(this, item) }>
                    <Icon type="step-forward"/>
                    <span>录制</span>
                  </Button>
                )
              }
              <Popconfirm title="确定要删除吗？" onConfirm={ this.onDelete.bind(this, item) }>
                <Button className={ publicStyle.ml10 } type="danger" disabled={ this.props.catching.has(item.roomid) }>
                  <Icon type="close-square" />
                  <span>删除</span>
                </Button>
              </Popconfirm>
            </div>
          );
        }
      }
    ];
    return columns;
  }
  async componentWillMount(){
    await this.props.action.cursorBilibiliLiveRoom({
      indexName: 'roomname'
    });
    this.setState({
      loading: false
    });
  }
  /**
   * 子进程监听
   * 子进程关闭时自动删除itemId对应的Map
   */
  child_process_exit(item, code, data){
    console.log('exit: ' + code + ' ' + data);
    this.child_process_cb(item);
  }
  child_process_error(item, err){
    console.error('error: \n' + err);
    this.child_process_cb(item);
  }
  // 子进程关闭
  async child_process_cb(item){
    const s = store.getState().get('bilibili').get('index');
    const [m, ll] = [s.get('catching'), s.get('liveList')];
    m.delete(item.roomid);

    this.props.action.catching({
      catching: m,
      liveList: ll.slice()
    });
  }
  // 录制
  async onCatch(item, event){
    const url = await getUrl(item.roomid);
    const title = `【B站直播抓取】${ item.roomname }_${ item.roomid }_${ time('YY-MM-DD-hh-mm-ss') }`;
    const child = child_process.spawn(
      __dirname + '/dependent/ffmpeg/ffmpeg.exe',
      ['-i', url, '-c', 'copy', `${ __dirname }/output/${ title }.flv`]
    );
    child.on('exit', this.child_process_exit.bind(this, item));
    child.on('error', this.child_process_error.bind(this, item));

    this.props.catching.set(item.roomid, {
      child: child,
      item: item
    });
    this.props.action.catching({
      catching: this.props.catching,
      liveList: this.props.liveList.slice()
    });
    message.success(`开始录制【${ item.roomname }】！`);
  }
  // 停止
  onCatchStop(item, event){
    const m = this.props.catching.get(item.roomid);
    m.child.kill();
    message.warn(`停止录制【${ item.roomname }】！`);
  }
  // 删除
  async onDelete(item, event){
    try{
      this.props.action.deleteBilibiliLiveRoom({
        data: item.roomid
      });
      message.success('删除成功！');
    }catch(err){
      message.error('删除失败！');
    }
  }
  render(){
    return(
      <div>
        {/* 功能区 */}
        <Affix>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fl }>
              <Link to="/BiliBili/Option">
                <Button type="primary">
                  <Icon type="setting" />
                  <span>添加B站直播间</span>
                </Button>
              </Link>
            </div>
            <div className={ publicStyle.fr }>
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
                 rowKey={ (item)=>item.roomid }
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

export default BiliBili;