/* 微打赏统计 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Input, Popconfirm, Checkbox } from 'antd';
import classNames from 'classnames';
import { modianList } from '../reducer/reducer';
import style from './style.sass';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import { searchTitle, searchTitleNoIdol } from './search';
import generatingExcel from './generatingExcel';

/* 初始化数据 */
const state = createStructuredSelector({
  modianList: createSelector( // 当前查询列表
    ($$state) => $$state.has('modian') ? $$state.get('modian') : null,
    ($$data) => $$data !== null ? $$data.get('modianList').toJS() : []
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    modianList
  }, dispatch)
});

@connect(state, actions)
class Index extends Component {
  static propTypes = {
    modianList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor(props) {
    super(...arguments);

    this.state = {
      btnLoading: false, // 按钮加载动画
      modianid: '',      // 摩点id
      modiantitle: '',   // 摩点标题
      noIdol: false,     // 是否为偶像应援项目
      moxiId: ''         // moxiId
    };
  }

  // 配置
  columus() {
    const columus = [
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
        render: (value, item) => {
          return [
            <Button key="excel"
              className={ publicStyle.mr10 }
              type="primary"
              icon="file-excel"
              onClick={ this.handleToExcelClick.bind(this, item) }
            >
              导出EXCEL
            </Button>,
            <Popconfirm key="delete" title="确认要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, item) }>
              <Button type="danger" icon="delete">删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];

    return columus;
  }

  // 查询标题
  async handleSearchTitleClick(event) {
    this.setState({ btnLoading: true });

    const { title, moxiId } = this.state.noIdol
      ? await searchTitleNoIdol(this.state.modianid)
      : await searchTitle(this.state.modianid);

    this.setState({
      modiantitle: title,
      moxiId,
      btnLoading: false
    });
    if (!title) message.info('项目不存在！');
  }

  // input change
  handleMoDianIdChange(event) {
    this.setState({
      modianid: event.target.value,
      modiantitle: ''
    });
  }

  // checkbox
  handleCheckboxChange(event) {
    this.setState({
      noIdol: event.target.checked
    });
  }

  // 删除
  handleDeleteClick(item, event) {
    const index = this.props.modianList.indexOf(item);
    const c = this.props.modianList;

    c.splice(index, 1);
    this.props.action.modianList({
      modianList: c
    });
  }

  // 添加到列表
  handleAddClick(event) {
    if (this.state.modiantitle) {
      this.props.modianList.push({
        modianid: this.state.modianid,
        modiantitle: this.state.modiantitle,
        noIdol: this.state.noIdol,
        moxiId: this.state.moxiId
      });

      this.props.action.modianList({
        modianList: this.props.modianList
      });
      this.setState({
        modianid: '',
        modiantitle: '',
        noIdol: false,
        moxiId: ''
      });
    } else {
      message.info('项目不存在！');
    }
  }

  // 导入到excel
  handleToExcelClick(item, event) {
    generatingExcel([item], item.modiantitle);
    message.info('正在生成Excel！');
  }

  // 全部导入到excel
  handleToExcelAllClick(event) {
    generatingExcel(this.props.modianList, '');
    message.info('正在生成Excel！');
  }

  render() {
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
            <Checkbox checked={ this.state.noIdol } onChange={ this.handleCheckboxChange.bind(this) } />
            <span className={ style.noIdolText }>非偶像应援项目</span>
            <Button loading={ this.state.btnLoading }
              icon="search"
              disabled={ !/^\s*[0-9]+\s*$/.test(this.state.modianid) }
              onClick={ this.handleSearchTitleClick.bind(this) }
            >
              查询
            </Button>
            <Button className={ publicStyle.ml10 }
              type="primary"
              icon="file-add"
              loading={ this.state.btnLoading }
              disabled={ /^\s*$/.test(this.state.modianid) || /^\s*$/.test(this.state.modiantitle) }
              onClick={ this.handleAddClick.bind(this) }
            >
              添加
            </Button>
            <Button className={ publicStyle.ml10 }
              type="primary"
              icon="api"
              disabled={ this.props.modianList.length === 0 }
              onClick={ this.handleToExcelAllClick.bind(this) }
            >
              生成EXCEL
            </Button>
            <b className={ style.tishi }>结果生成到一个Excel中</b>
          </div>
          <div className={ publicStyle.fr }>
            <Link to="/MoDian/TotalRanking">
              <Button className={ publicStyle.mr10 } type="primary" icon="dot-chart">计算总排行</Button>
            </Link>
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
          rowKey={ (item) => item.modianid }
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

export default Index;