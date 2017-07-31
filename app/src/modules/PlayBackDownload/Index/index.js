/* 口袋48录播下载 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Icon, Affix, message, Input } from 'antd';
import { playBackList } from '../store/index';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
import post from '../../pubmicMethod/post';
import { time } from '../../../function';

/**
 * 搜索的过滤函数
 * @param { Array } array   : 需要过滤的数组
 * @param { String } keyword: 关键字
 * @param { String } key    : 参考键值
 * @return { Array }
 */
function filter(array, keyword, key){
  if(/^\s*$/.test(keyword)){
    return array;
  }else{
    const newArr = [];
    const keywordRegExp = new RegExp(`(${ keyword.split(/\s+/).join('|') })`);
    array.map((item, index)=>{
      if(keywordRegExp.test(item[key])){
        newArr.push(item);
      }
    });
    return newArr;
  }
}

/* 初始化数据 */
const getIndex = (state)=>state.get('playBackDownload').get('index');

const state = createStructuredSelector({
  playBackList: createSelector(         // 当前录播
    getIndex,
    (data)=>data.has('playBackList') ? data.get('playBackList') : []
  ),
  giftUpdTime: createSelector(          // 加载时间戳
    getIndex,
    (data)=>data.has('giftUpdTime') ? data.get('giftUpdTime') : 0
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    playBackList
  }, dispatch),
});

@connect(state, dispatch)
class PlayBackDownload extends Component{
  constructor(props){
    super(props);

    this.state = {
      loading: false,    // 加载动画
      keyword: ''        // 搜索关键字
    };
  }
  // 表格配置
  columus(){
    const columns = [
      {
        title: '直播ID',
        dataIndex: 'liveId',
        key: 'liveId',
        width: '20%'
      },
      {
        title: '直播间',
        dataIndex: 'title',
        key: 'title',
        width: '15%'
      },
      {
        title: '直播标题',
        dataIndex: 'subTitle',
        key: 'subTitle',
        width: '35%'
      },
      {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        width: '15%',
        render: (text, item)=>time('YY-MM-DD hh:mm:ss', text)
      },
      {
        title: '操作',
        key: 'handle',
        width: '25%',
        render: (text, item)=>{
          return(
            <div>
              <Button className={ publicStyle.ml10 }>
                <Icon type="eye" />
                <span>查看</span>
              </Button>
              <Button className={ publicStyle.ml10 }>
                <Icon type="fork" />
                <span>下载</span>
              </Button>
            </div>
          );
        }
      }
    ];
    return columns;
  }
  // 搜索事件（点击按钮 + input回车）
  onSearchInput(event){
    this.setState({
      keyword: this.refs['playBackDownload-searchInput'].refs.input.value
    });
  }
  // 重置
  onReset(event){
    this.setState({
      keyword: ''
    });
  }
  // 加载和刷新列表
  async onPlayBackListLoad(type, event){
    this.setState({
      loading: true
    });
    // 判断是加载还是刷新
    let pl = null;
    let giftUpdTime = null;
    switch(type){
      case '加载':
        pl = this.props.playBackList;
        giftUpdTime = this.props.giftUpdTime;
        break;
      case '刷新':
        pl = [];
        giftUpdTime = 0;
        break;
    }
    // 获取数据
    const data = await post(giftUpdTime);
    const data2 = JSON.parse(data);
    // 更新列表
    this.props.action.playBackList({
      playBackList: pl.concat(data2.content.reviewList),
      giftUpdTime: data2.content.giftUpdTime
    });
    this.setState({
      loading: false
    });
    message.success('录播加载成功！');
  }
  render(){
    return(
      <div>
        {/* 功能区 */}
        <Affix>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fl }>
              <label className={ publicStyle.mr10 } htmlFor="playBackDownload-searchInput">搜索已加载列表：</label>
              <Input className={ `${ publicStyle.mr10 } ${ style.searchInput }` }
                     id="playBackDownload-searchInput"
                     ref="playBackDownload-searchInput"
                     placeholder="多个关键字用空格分割"
                     onPressEnter={ this.onSearchInput.bind(this) } />
              <Button className={ publicStyle.mr10 } onClick={ this.onSearchInput.bind(this) }>
                <Icon type="search" />
                <span>搜索</span>
              </Button>
              <Button className={ publicStyle.mr10 } onClick={ this.onReset.bind(this) }>
                <Icon type="close" />
                <span>重置</span>
              </Button>
            </div>
            <div className={ publicStyle.fr }>
              <Button className={ publicStyle.ml10 }
                      type="primary"
                      onClick={ this.onPlayBackListLoad.bind(this, '加载') }>
                <Icon type="cloud-download-o" />
                <span>加载列表</span>
              </Button>
              <Button className={ publicStyle.ml10 } onClick={ this.onPlayBackListLoad.bind(this, '刷新') }>
                <Icon type="loading-3-quarters" />
                <span>刷新列表</span>
              </Button>
              <Button className={ `${ publicStyle.ml10 } ${ publicStyle.btn }` } type="danger">
                <Icon type="poweroff" />
                <span>返回</span>
                <Link className={ publicStyle.btnLink } to="/" />
              </Button>
            </div>
          </div>
        </Affix>
        {/* 显示列表 */}
        <div className={ publicStyle.tableBox }>
          <Table loading={ this.state.loading }
                 bordered={ true }
                 columns={ this.columus() }
                 rowKey={ (item)=>item.liveId }
                 dataSource={ filter(this.props.playBackList, this.state.keyword, 'title') }
                 pagination={{
                   pageSize: 20,
                   showQuickJumper: true
                 }} />
        </div>
      </div>
    );
  }
}

export default PlayBackDownload;