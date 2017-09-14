// @flow
/* 直播视频下载 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Icon, Affix, message, Select } from 'antd';
import { liveList, liveListInit, changeGroup } from '../store/index';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import { loadList, queryHtml } from './loadList';

/* 初始化数据 */
const getIndex: Function = (state: Object): ?Object=>state.has('liveDownload') ? state.get('liveDownload').get('index') : null;

const state: Function = createStructuredSelector({
  liveList: createSelector(         // 当前公演录播列表
    getIndex,
    (data: ?Object): Array=>data !== null && data.has('liveList') ? data.get('liveList') : []
  ),
  page: createSelector(             // 当前页码
    getIndex,
    (data: ?Object): number=>data !== null && data.has('page') ? data.get('page') : 1
  ),
  pageLen: createSelector(          // 当前页数
    getIndex,
    (data: ?Object): number=>data !== null && data.has('pageLen') ? data.get('pageLen') : 1
  ),
  group: createSelector(
    getIndex,                       // 选择团
    (data: ?Object): string=>data !== null && data.has('group') ? data.get('group') : 'SNH48'
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    liveList,
    liveListInit,
    changeGroup
  }, dispatch)
});

@connect(state, dispatch)
class LiveDownload extends Component{
  state: {
    loading: boolean
  };
  constructor(props: Object): void{
    super(props);

    this.state = {
      loading: false
    };
  }
  // 表格配置
  columus(): Array{
    const columus: Array = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: '25%'
      },
      {
        title: '标题',
        key: 'title',
        render: (text: any, item: Object): string=>{
          return(
            <div>
              <b className={ style.title }>{ item.title }</b>
              <span>{ item.secondTitle }</span>
            </div>
          );
        }
      },
      {
        title: '视频下载',
        key: 'handle',
        width: '20%',
        render: (text: any, item: Object): string=>{
          return(
            <div>
              <Button className={ publicStyle.mr10 }>超清</Button>
              <Button className={ publicStyle.mr10 }>高清</Button>
              <Button>流畅</Button>
            </div>
          );
        }
      }
    ];
    return columus;
  }
  onGroupSelect(value: string, option: any): void{
    this.props.action.changeGroup({
      group: value
    });
  }
  // 加载列表
  async onLoadList(page: number, pageSize: number, event: Object): void{
    this.setState({
      loading: true
    });
    try{
      const html = await loadList(this.props.group, page);
      const { result, pageLen }: {
        result: Array,
        pageLen: number
      } = queryHtml(html);
      this.props.action.liveListInit({
        liveList: result,
        pageLen: pageLen,
        page
      });
      message.success('加载成功');
    }catch(err){
      message.error('加载失败');
    }
    this.setState({
      loading: false
    });
  }
  render(){
    return(
      <div>
        {/* 功能区 */}
        <Affix className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fl }>
              <Select className={ style.select }
                      value={ this.props.group }
                      dropdownMatchSelectWidth={ true }
                      dropdownClassName={ style.select }
                      onSelect={ this.onGroupSelect.bind(this) }>
                <Select.Option key="SNH48" value="SNH48">SNH48</Select.Option>
                <Select.Option key="BEJ48" value="BEJ48">BEJ48</Select.Option>
                <Select.Option key="GNZ48" value="GNZ48">GNZ48</Select.Option>
                <Select.Option key="SHY48" value="SHY48">SHY48</Select.Option>
                <Select.Option key="CKG48" value="CKG48" disabled={ true }>CKG48</Select.Option>
              </Select>
              <Button className={ publicStyle.ml10 } type="primary" onClick={ this.onLoadList.bind(this, 1, 15) }>
                <Icon type="cloud" />
                <span>刷新公演录播列表</span>
              </Button>
            </div>
            <div className={ publicStyle.fr }>
              <Link to="/">
                <Button type="danger">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Button>
              </Link>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div className={ `${ publicStyle.tableBox } ${ style.tableBox }` }>
          <Table loading={ this.state.loading }
                 bordered={ true }
                 columns={ this.columus() }
                 rowKey={ (item: Object): number=>item.id }
                 dataSource={ this.props.liveList }
                 pagination={{
                   pageSize: 15,
                   showQuickJumper: true,
                   current: this.props.page,
                   total: this.props.liveList.length === 0 ? 0 : this.props.pageLen * 15,
                   onChange: this.onLoadList.bind(this)
                 }} />
        </div>
      </div>
    );
  }
}

export default LiveDownload;