/* 微打赏统计 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Affix, message, Input, Popconfirm } from 'antd';
import { wdsList } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import { searchTitle } from './search';
import generatingExcel from './generatingExcel';

/* 初始化数据 */
const state: Function = createStructuredSelector({
  wdsList: createSelector(         // 当前查询列表
    (state: Object): ?Object => state.has('wds') ? state.get('wds') : null,
    (data: ?Object): Array=>{
      const wdsList: Object | Array = data.get('wdsList');
      return wdsList instanceof Array ? wdsList : wdsList.toJS()
    }
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
  state: {
    btnLoading: boolean,
    wdsid: string,
    wdstitle: string
  };
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
        render: (text: any, item: Object): Array=>{
          return [
            <Button key={ 0 } className={ publicStyle.mr10 } type="primary" icon="file-excel" onClick={ this.onToExcel.bind(this, item) }>导出EXCEL</Button>,
            <Popconfirm key={ 1 } title="确认要删除吗？" onConfirm={ this.onDelete.bind(this, item) }>
              <Button type="danger" icon="delete">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];
    return columus;
  }
  // 查询标题
  async onSearchTitle(event: Event): void{
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
  onWdsIdChange(event: Event): void{
    this.setState({
      wdsid: event.target.value,
      wdstitle: ''
    });
  }
  // 删除
  onDelete(item: Object, event: Event): void{
    const index: number = this.props.wdsList.indexOf(item);
    const c: Array = this.props.wdsList.slice();
    c.splice(index, 1);
    this.props.action.wdsList({
      wdsList: c
    });
  }
  // 添加到列表
  onAdd(event: Event): void{
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
  onToExcel(item: Object, event: Event): void{
    generatingExcel([item], item.wdstitle);
    message.info('正在生成Excel！');
  }
  // 全部导入到excel
  onToExcelAll(event: Event): void{
    generatingExcel(this.props.wdsList, '');
    message.info('正在生成Excel！');
  }
  render(): Array{
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <label htmlFor="wds-id">微打赏ID: </label>
            <Input className={ style.inputId }
              id="wds-id"
              value={ this.state.wdsid }
              onChange={ this.onWdsIdChange.bind(this) }
            />
            <label htmlFor="wds-title">微打赏标题: </label>
            <Input className={ style.inputTitle }
              id="wds-title"
              readOnly
              value={ this.state.wdstitle }
            />
            <Button loading={ this.state.btnLoading }
              icon="search"
              disabled={ !/^\s*[0-9]+\s*$/.test(this.state.wdsid) }
              onClick={ this.onSearchTitle.bind(this) }
            >
              查询
            </Button>
            <Button className={ publicStyle.ml10 }
              type="primary"
              icon="file-add"
              loading={ this.state.btnLoading }
              disabled={ /^\s*$/.test(this.state.wdsid) || /^\s*$/.test(this.state.wdstitle) }
              onClick={ this.onAdd.bind(this) }
            >
              添加
            </Button>
            <Button className={ publicStyle.ml10 }
              type="primary"
              icon="api"
              disabled={ this.props.wdsList.length === 0 }
              onClick={ this.onToExcelAll.bind(this) }
            >
              生成EXCEL
            </Button>
            <b className={ style.tishi }>结果生成到一个Excel中</b>
          </div>
          <div className={ publicStyle.fr }>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ publicStyle.tableBox }>
        <Table bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): string=>item.wdsid }
          dataSource={ this.props.wdsList }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </div>
    ];
  }
}

export default Wds;