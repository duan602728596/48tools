// @flow
/* 微打赏统计 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Icon, Affix, message, Input, Popconfirm } from 'antd';
import { wdsList } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { searchTitle } from './search';
import generatingExcel from './generatingExcel';

/* 初始化数据 */
const state: Function = createStructuredSelector({
  wdsList: createSelector(         // 当前查询列表
    (state: Object): Object | Array=>state.has('wds') ? state.get('wds').get('wdsList') : [],
    (data: Object | Array): Array=>data instanceof Array ? data : data.toJS()
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    wdsList
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Wds extends Component{
  constructor(props: Object): Object{
    super(props);

    this.state = {
      btnLoading: false,             // 按钮加载动画
      wdsid: '',                     // 微打赏id
      wdstitle: ''                   // 微打赏标题
    };
  }
  // 配置
  columus(): Array{
    const columus: Array = [
      {
        title: '微打赏ID',
        key: 'wdsid',
        dataIndex: 'wdsid',
        width: '33%'
      },
      {
        title: '微打赏标题',
        key: 'wdstitle',
        dataIndex: 'wdstitle',
        width: '34%'
      },
      {
        title: '操作',
        dataIndex: 'handle',
        width: '33%',
        render: (text: any, item: Object): Object=>{
          return(
            <div>
              <Button className={ publicStyle.mr10 } type="primary" onClick={ this.onToExcel.bind(this, item) }>
                <Icon type="file-excel" />
                <span>导出EXCEL</span>
              </Button>
              <Popconfirm title="确认要删除吗？" onConfirm={ this.onDelete.bind(this, item) }>
                <Button type="danger">
                  <Icon type="delete" />
                  <span>删除</span>
                </Button>
              </Popconfirm>
            </div>
          );
        }
      }
    ];
    return columus;
  }
  // 查询标题
  async onSearchTitle(event: Object): void{
    this.setState({
      btnLoading: true
    });
    const title: string = await searchTitle(this.state.wdsid);
    this.setState({
      wdstitle: title,
      btnLoading: false
    });
  }
  // input change
  onWdsIdChange(event: Object): void{
    this.setState({
      wdsid: event.target.value,
      wdstitle: ''
    });
  }
  // 删除
  onDelete(item: Object, event: Object): void{
    const index: number = this.props.wdsList.indexOf(item);
    const c: Array = this.props.wdsList.slice();
    c.splice(index, 1);
    this.props.action.wdsList({
      wdsList: c
    });
  }
  // 添加到列表
  onAdd(event: Object): void{
    this.props.wdsList.push({
      wdsid: this.state.wdsid,
      wdstitle: this.state.wdstitle
    });

    this.props.action.wdsList({
      wdsList: this.props.wdsList
    });
    this.setState({
      wdsid: '',
      wdstitle: ''
    });
  }
  // 导入到excel
  onToExcel(item: Object, event: Object): void{
    generatingExcel([item], item.wdstitle);
    message.info('正在生成Excel！');
  }
  // 全部导入到excel
  onToExcelAll(event: Object): void{
    generatingExcel(this.props.wdsList, '');
    message.info('正在生成Excel！');
  }
  render(): Object{
    return(
      <div>
        {/* 功能区 */}
        <Affix className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fl }>
              <label htmlFor="wds-id">微打赏ID: </label>
              <Input className={ style.inputId }
                     id="wds-id"
                     value={ this.state.wdsid }
                     onChange={ this.onWdsIdChange.bind(this) } />
              <label htmlFor="wds-title">微打赏标题: </label>
              <Input className={ style.inputTitle }
                     id="wds-title"
                     readOnly
                     value={ this.state.wdstitle } />
              <Button loading={ this.state.btnLoading }
                      disabled={ !/^\s*[0-9]+\s*$/.test(this.state.wdsid) }
                      onClick={ this.onSearchTitle.bind(this) }>
                <Icon type="search" />
                <span>查询</span>
              </Button>
              <Button className={ publicStyle.ml10 }
                      type="primary"
                      loading={ this.state.btnLoading }
                      disabled={ /^\s*$/.test(this.state.wdsid) || /^\s*$/.test(this.state.wdstitle) }
                      onClick={ this.onAdd.bind(this) }>
                <Icon type="file-add" />
                <span>添加</span>
              </Button>
              <Button className={ publicStyle.ml10 }
                      type="primary"
                      disabled={ this.props.wdsList.length === 0 }
                      onClick={ this.onToExcelAll.bind(this) }>
                <Icon type="api" />
                <span>生成EXCEL</span>
              </Button>
              <b className={ style.tishi }>结果生成到一个Excel中</b>
            </div>
            <div className={ publicStyle.fr }>
              <Link className={ publicStyle.ml10 } to="/">
                <Button type="danger">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Button>
              </Link>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div className={ publicStyle.tableBox }>
          <Table bordered={ true }
                 columns={ this.columus() }
                 rowKey={ (item: Object): string=>item.wdsid }
                 dataSource={ this.props.wdsList }
                 pagination={{
                   pageSize: 20,
                   showQuickJumper: true
                 }} />
        </div>
      </div>
    );
  }
}

export default Wds;