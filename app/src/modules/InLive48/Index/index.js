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
import { inLiveList } from '../store/reducer';
import { time } from '../../../utils';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
const child_process: Object = global.require('child_process');
const cheerio: Object = global.require('cheerio');

const IN_LIVE_URL: Object = {
  SNH48: 'http://zhibo.ckg48.com',   // 48直播地址重定向
  BEJ48: 'http://live.bej48.com',
  GNZ48: 'http://live.gnz48.com',
  SHY48: 'http://live.shy48.com',
  CKG48: 'http://live.ckg48.com'
};

/* 初始化数据 */
const state: Function = createStructuredSelector({
  inLiveList: createSelector(         // 当前查询列表
    ($$state: Immutable.Map): ?Immutable.Map => $$state.has('inLive48') ? $$state.get('inLive48') : null,
    ($$data: ?Immutable.Map): Array => $$data !== null ? $$data.get('inLiveList').toJS() : []
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    inLiveList
  }, dispatch)
});

@connect(state, dispatch)
class InLive48 extends Component{
  state: {
    group: string,
    quality: string
  };

  static propTypes: Object = {
    inLiveList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor(): void{
    super(...arguments);

    this.state = {
      group: 'SNH48',
      quality: 'gao_url'
    };
  }
  // 表格配置
  columus(): Array{
    const columus: Array = [
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
        render: (text: string, item: Object, index: number): React.ChildrenArray<React.Element>=>{
          return [
            item.child.killed === false && item.child.exitCode === null
              ? [
                <Button key="stop" type="danger" icon="close-square" onClick={ this.handleStop.bind(this, item) }>取消下载</Button>
              ] : [
                <b key="isStop" className={ publicStyle.mr10 }>已停止</b>,
                <Popconfirm key="delete" title="确定要删除吗？" onConfirm={ this.handleDelete.bind(this, item) }>
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
  handleSelect(key: string, value: string, option: any): void{
    this.setState({
      [key]: value
    });
  }
  // 获取页面信息
  getHtml(url: string): Promise{
    return new Promise((resolve: Function, reject: Function): void=>{
      $.ajax({
        url,
        type: 'GET',
        cache: true,
        dataType: 'text',
        success(data: string, status: string, xhr: XMLHttpRequest): void{
          resolve(data);
        },
        error(xhr: XMLHttpRequest, err: any): void{
          reject(err);
        }
      });
    });
  }
  // 获取直播间地址（新的直播间地址，其他地方使用旧的直播间地址）
  getInliveUrl(): Promise{
    return new Promise((resolve: Function, reject: Function): void=>{
      $.ajax({
        url: IN_LIVE_URL[this.state.group],
        type: 'GET',
        cache: true,
        dataType: 'text',
        success(data: string, status: string, xhr: XMLHttpRequest): void{
          const xml: any = cheerio.load(data);
          resolve(xml('.v-img a').attr('href'));
        },
        error(xhr: XMLHttpRequest, err: any): void{
          reject(err);
        }
      });
    });
  }
  // 点击录制事件
  async handleDownLoadLive(event: Event): Promise<void | boolean>{
    const inliveUrl: string = await this.getInliveUrl();
    const html: string = await this.getHtml(IN_LIVE_URL[this.state.group] + inliveUrl);
    const xml: any = cheerio.load(html);
    const title: string = `【官方源】${ this.state.group }_${ time('YY.MM.DD_hh.mm.ss') }`;
    const urlInput: any = xml(`#${ this.state.quality }`);
    if(urlInput.length === 0){
      message.warn('直播未开始！');
      return false;
    }

    const liveUrl: string = urlInput.attr('value');
    const child: Object = child_process.spawn(option.ffmpeg, [
      '-i',
      `${ liveUrl }`,
      '-c',
      'copy',
      `${ option.output }/${ title }.flv`
    ]);
    child.stdout.on('data', child_process_stdout);
    child.stderr.on('data', child_process_stderr);
    child.on('close', child_process_exit);
    child.on('error', child_process_error);

    const ils: Array = this.props.inLiveList;
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
  handleStop(item: Object, event: Event): void{
    item.child.kill();
  }
  // 删除
  handleDelete(item: Object, event: Event): void{
    const index: number = this.props.inLiveList.indexOf(item);
    const ils: Array = this.props.inLiveList;
    ils.splice(index, 1);
    this.props.action.inLiveList({
      inLiveList: ils
    });
  }
  render(): React.Element{
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
              <Button type="primary" icon="cloud-download" onClick={ this.handleDownLoadLive.bind(this) }>录制官方源</Button>
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
          rowKey={ (item: Object): string => item.title }
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

export default InLive48;