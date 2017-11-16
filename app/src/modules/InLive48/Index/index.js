/* 直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import jQuery from 'jquery';
import { Affix, Button, Select, Table } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import option from '../../publicMethod/option';
import style from './style.sass';
import { inLiveList } from '../store/reducer';
import { time } from '../../../function';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
const child_process = node_require('child_process');
const cheerio = node_require('cheerio');

const IN_LIVE_URL: Object = {
  SNH48: 'http://live.snh48.com/Index/inlive',
  BEJ48: 'http://live.bej48.com/Index/inlive',
  GNZ48: 'http://live.gnz48.com/Index/inlive',
  SHY48: 'http://live.shy48.com/Index/inlive',
  CKG48: 'http://live.ckg48.com/Index/inlive'
};

/* 初始化数据 */
const state: Function = createStructuredSelector({
  inLiveList: createSelector(         // 当前查询列表
    (state: Object): Object | Array=>state.has('inLive48') ? state.get('inLive48').get('inLiveList') : [],
    (data: Object | Array): Array=>data instanceof Array ? data : data.toJS()
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
    group: string
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      group: 'SNH48'
    };
  }
  // 表格配置
  columus(): Array{
    const columus: Array = [
      {
        title: '团名称',
        dataIndex: 'group',
        key: 'group',
        width: '33%'
      },
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        width: '34%'
      },
      {
        title: '操作',
        key: 'handle',
        width: '33%',
        render: (text: string, item: Object, index: number): Object | Array=>{
          return [
            item.child.killed === false && item.child.exitCode === null ?
              (
                <Button type="danger" size="small" icon="close-square">取消下载</Button>
              ) : [
                <b key={ 0 } className={ publicStyle.mr10 }>已停止</b>,
                <Button key={ 1 } type="danger" size="small" icon="delete">删除</Button>
              ]
          ];
        }
      }
    ];
    return columus;
  }
  // select选择
  onSelect(key: string, value: string, option: any): void{
    this.setState({
      [key]: value
    });
  }
  // 获取页面信息
  getHtml(): Promise{
    return new Promise((resolve: Function, reject: Function): void=>{
      jQuery.ajax({
        url: IN_LIVE_URL[this.state.group],
        type: 'GET',
        cache: true,
        dataType: 'text',
        success: function(data: string, status: string, xhr: XMLHttpRequest): void{
          resolve(data);
        },
        error: function(err: any): void{
          reject(err);
        }
      });
    });
  }
  // 点击录制事件
  async onDownLoadLive(event: Object): void{
    const html: string = await this.getHtml();
    const xml: any = cheerio.load(html);
    const liveUrl: string = '';
    const title: string = `【官方源】${ this.state.group }_${ time('YY.MM.DD_hh.mm.ss') }`;

    const child: Object = child_process.spawn(option.ffmpeg, [
      `-i`,
      `${ liveUrl }`,
      `-c`,
      `copy`,
      `${ option.output }/${ title }.flv`
    ]);
    child.stdout.on('data', child_process_stdout);
    child.stderr.on('data', child_process_stderr);
    child.on('close', child_process_exit);
    child.on('error', child_process_error);
  }
  render(): Array{
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <Select className={ `${ publicStyle.mr10 } ${ style.select }` }
              value={ this.state.group }
              dropdownMatchSelectWidth={ true }
              dropdownClassName={ style.select }
              onSelect={ this.onSelect.bind(this, 'group') }
            >
              <Select.Option key="SNH48" value="SNH48">SNH48</Select.Option>
              <Select.Option key="BEJ48" value="BEJ48">BEJ48</Select.Option>
              <Select.Option key="GNZ48" value="GNZ48">GNZ48</Select.Option>
              <Select.Option key="SHY48" value="SHY48">SHY48</Select.Option>
              <Select.Option key="CKG48" value="CKG48">CKG48</Select.Option>
            </Select>
            <Button type="primary" icon="cloud-download" onClick={ this.onDownLoadLive.bind(this) }>录制官方源</Button>
          </div>
          <div className={ publicStyle.fr }>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 录制列表 */
      <Table key={ 1 }
        className={ publicStyle.tableBox }
        bordered={ true }
        columns={ this.columus() }
        rowKey={ (item: Object): number=>item.id }
        dataSource={ this.props.inLiveList }
        pagination={{
          pageSize: 20,
          showQuickJumper: true
        }}
      />
    ];
  }
}

export default InLive48;