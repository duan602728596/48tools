/* 微打赏统计 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Input, Popconfirm } from 'antd';
import classNames from 'classnames';
import { modianList } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import { searchTitle } from './search';
import generatingExcel from './generatingExcel';

/* 初始化数据 */
const state: Function = createStructuredSelector({
  modianList: createSelector(         // 当前查询列表
    ($$state: Immutable.Map): ?Immutable.Map => $$state.has('modian') ? $$state.get('modian') : null,
    ($$data: ?Immutable.Map): Array => $$data !== null ? $$data.get('modianList').toJS() : []
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    modianList
  }, dispatch)
});

@connect(state, dispatch)
class MoDian extends Component{
  state: {
    btnLoading: boolean,
    modianid: string,
    modiantitle: string
  };

  static propTypes: Object = {
    modianList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor(props: Object): void{
    super(...arguments);

    this.state = {
      btnLoading: false,  // 按钮加载动画
      modianid: '',       // 摩点id
      modiantitle: ''     // 摩点标题
    };
  }
  // 配置
  columus(): Array{
    const columus: Array = [
      {
        title: '摩点项目ID',
        key: 'modianid',
        dataIndex: 'modianid',
        width: '33%'
      },
      {
        title: '摩点项目标题',
        key: 'modiantitle',
        dataIndex: 'modiantitle',
        width: '34%'
      },
      {
        title: '操作',
        dataIndex: 'handle',
        width: '33%',
        render: (text: any, item: Object): React.ChildrenArray<React.Element>=>{
          return [
            <Button key={ 0 }
              className={ publicStyle.mr10 }
              type="primary"
              icon="file-excel"
              onClick={ this.handleToExcel.bind(this, item) }
            >
              导出EXCEL
            </Button>,
            <Popconfirm key={ 1 } title="确认要删除吗？" onConfirm={ this.handleDelete.bind(this, item) }>
              <Button type="danger" icon="delete">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];
    return columus;
  }
  // 查询标题
  async handleSearchTitle(event: Event): Promise<void>{
    this.setState({
      btnLoading: true
    });
    const { title }: { title: ?string } = await searchTitle(this.state.modianid);
    this.setState({
      modiantitle: title,
      btnLoading: false
    });
    if(!title) message.info('项目不存在！');
  }
  // input change
  handleMoDianIdChange(event: Event): void{
    this.setState({
      modianid: event.target.value,
      modiantitle: ''
    });
  }
  // 删除
  handleDelete(item: Object, event: Event): void{
    const index: number = this.props.modianList.indexOf(item);
    const c: Array = this.props.modianList;
    c.splice(index, 1);
    this.props.action.modianList({
      modianList: c
    });
  }
  // 添加到列表
  handleAdd(event: Event): void{
    if(this.state.modiantitle){
      this.props.modianList.push({
        modianid: this.state.modianid,
        modiantitle: this.state.modiantitle
      });

      this.props.action.modianList({
        modianList: this.props.modianList
      });
      this.setState({
        modianid: '',
        modiantitle: ''
      });
    }else{
      message.info('项目不存在！');
    }
  }
  // 导入到excel
  handleToExcel(item: Object, event: Event): void{
    generatingExcel([item], item.modiantitle);
    message.info('正在生成Excel！');
  }
  // 全部导入到excel
  handleToExcelAll(event: Event): void{
    generatingExcel(this.props.modianList, '');
    message.info('正在生成Excel！');
  }
  render(): React.ChildrenArray<React.Element>{
    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
          <div className={ publicStyle.fl }>
            <label htmlFor="modian-id">摩点项目ID: </label>
            <Input className={ style.inputId }
              id="modian-id"
              value={ this.state.modianid }
              onChange={ this.handleMoDianIdChange.bind(this) }
            />
            <label htmlFor="modian-title">摩点项目标题: </label>
            <Input className={ style.inputTitle }
              id="modian-title"
              readOnly={ true }
              value={ this.state.modiantitle }
            />
            <Button loading={ this.state.btnLoading }
              icon="search"
              disabled={ !/^\s*[0-9]+\s*$/.test(this.state.modianid) }
              onClick={ this.handleSearchTitle.bind(this) }
            >
              查询
            </Button>
            <Button className={ publicStyle.ml10 }
              type="primary"
              icon="file-add"
              loading={ this.state.btnLoading }
              disabled={ /^\s*$/.test(this.state.modianid) || /^\s*$/.test(this.state.modiantitle) }
              onClick={ this.handleAdd.bind(this) }
            >
              添加
            </Button>
            <Button className={ publicStyle.ml10 }
              type="primary"
              icon="api"
              disabled={ this.props.modianList.length === 0 }
              onClick={ this.handleToExcelAll.bind(this) }
            >
              生成EXCEL
            </Button>
            <b className={ style.tishi }>结果生成到一个Excel中</b>
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
        <Table bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): string => item.modianid }
          dataSource={ this.props.modianList }
          pagination={{
            pageSize: 20,
            showQuickJumper: true
          }}
        />
      </div>
    ];
  }
}

export default MoDian;