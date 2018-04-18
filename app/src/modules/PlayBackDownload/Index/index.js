/* 口袋48录播下载 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Affix, message, Input } from 'antd';
import { playBackList } from '../store/index';
import { downloadList, fnReady } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import post from '../../publicMethod/post';
import { time } from '../../../function';
import { onChromeDownloadsCreated, onChromeDownloadsChanged } from '../chromeFunction';
const url: Object = global.require('url');
const path: Object = global.require('path');

/**
 * 搜索的过滤函数
 * @param { Array } array   : 需要过滤的数组
 * @param { RegExp } keyword: 关键字的正则表达式
 * @param { string } key    : 参考键值
 * @param { number } from   : 查找范围
 * @param { number } to     : 查找范围
 * @return { Array }
 */
function filter(array: Array, keyword: ?RegExp, key: string, from: number, to: number): Array{
  // 如果没有搜索字符串，返回所有数组
  if(!keyword || array.length === 0){
    return array;
  }
  // 判断当前是否满足搜索匹配
  if(from === to){
    return keyword.test(array[from][key]) ? [array[from]] : [];
  }
  // 拆分数组
  const middle: number = Math.floor((to - from) / 2) + from;
  const left: Array = filter(array, keyword, key, from, middle);
  const right: Array = filter(array, keyword, key, middle + 1, to);
  return left.concat(right);
}

/* 初始化数据 */
const getIndex: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('playBackDownload') ? $$state.get('playBackDownload').get('index') : null;
const getState: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('playBackDownload') ? $$state.get('playBackDownload') : null;

const state: Function = createStructuredSelector({
  playBackList: createSelector(         // 当前录播
    getIndex,
    ($$data: ?Immutable.Map): Array => $$data !== null && $$data.has('playBackList') ? $$data.get('playBackList') : []
  ),
  giftUpdTime: createSelector(          // 加载时间戳
    getIndex,
    ($$data: ?Immutable.Map): number => $$data !== null && $$data.has('giftUpdTime') ? $$data.get('giftUpdTime') : 0
  ),
  downloadList: createSelector(         // 下载列表
    getState,
    ($$data: ?Immutable.Map): Map => $$data !== null ? $$data.get('downloadList') : new Map()
  ),
  fnReady: createSelector(              // 下载事件监听
    getState,
    ($$data: ?Immutable.Map): boolean => $$data !== null ? $$data.get('fnReady') : false
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    playBackList,
    downloadList,
    fnReady
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class PlayBackDownload extends Component{
  state: {
    loading: boolean,
    keyword: string,
    current: number
  };
  constructor(): void{
    super(...arguments);

    this.state = {
      loading: false,    // 加载动画
      keyword: '',       // 搜索关键字
      current: 'query' in this.props.location && 'current' in this.props.location.query ? this.props.location.query.current : 1 // 分页
    };
  }
  // 表格配置
  columus(): Array{
    const columns: Array = [
      {
        title: '直播ID',
        dataIndex: 'liveId',
        key: 'liveId',
        width: '17%'
      },
      {
        title: '直播间',
        dataIndex: 'title',
        key: 'title',
        width: '13%'
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
        render: (text: any, item: Object): string=>time('YY-MM-DD hh:mm:ss', text)
      },
      {
        title: '操作',
        key: 'handle',
        width: '30%',
        render: (text: any, item: Object): Array=>{
          return [
            <Link key={ 0 } to={{
              pathname: '/PlayBackDownload/Detail',
              query: {
                detail: item,
                current: this.state.current
              }
            }}>
              <Button className={ publicStyle.ml10 } icon="eye">查看</Button>
            </Link>,
            <Button key={ 1 } className={ publicStyle.ml10 } icon="fork" onClick={ this.onDownload.bind(this, item) }>下载</Button>
          ];
        }
      }
    ];
    return columns;
  }
  // 组件挂载之前监听chrome下载事件
  UNSAFE_componentWillMount(): void{
    if(this.props.fnReady === false){
      chrome.downloads.onCreated.addListener(onChromeDownloadsCreated);
      chrome.downloads.onChanged.addListener(onChromeDownloadsChanged);
      // 函数已监听的标识
      this.props.action.fnReady({
        fnReady: true
      });
    }
  }
  // 分页变化
  onPageChange(page: number, pageSize: number): void{
    this.setState({
      current: page
    });
  }
  // 下载
  onDownload(item: Object, event: Event): void{
    const urlInfo: Object = url.parse(item.streamPath);
    const pathInfo: Object = path.parse(urlInfo.pathname);

    const title: string = '【口袋48录播】' + '_' + item.title
                        + '_直播时间_' + time('YY-MM-DD-hh-mm-ss', item.startTime)
                        + '_下载时间_' + time('YY-MM-DD-hh-mm-ss')
                        + '_' + item.liveId;

    chrome.downloads.download({
      url: item.streamPath,
      filename: title + pathInfo.ext,
      conflictAction: 'prompt',
      saveAs: true,
      method: 'GET'
    }, (downloadId: number): void=>{
      // 此处需要添加item详细信息
      const obj: Object = this.props.downloadList.get(downloadId);
      obj.item = item;
      // 更新数据
      this.props.downloadList.set(downloadId, obj);
      // 更新store内的数据
      this.props.action.downloadList({
        downloadList: this.props.downloadList
      });
    });
  }
  // 搜索事件（点击按钮 + input回车）
  onSearchInput(event: Event): void{
    const { value }: { value: string } = this.refs['playBackDownload-searchInput'].input;
    let reg: ?RegExp = null;
    if(!/^\s*$/.test(value)){
      const str: string[] = value.split(/\s+/);
      for(let i: number = str.length - 1; i >= 0; i--){
        if(str[i] === '') str.splice(i, 1);
      }
      reg = new RegExp(`(${ str.join('|') })`, 'i');
    }

    this.setState({
      keyword: reg
    });
  }
  // 重置
  onReset(event: Event): void{
    this.setState({
      keyword: ''
    });
  }
  // 加载和刷新列表
  async onPlayBackListLoad(type: string, event: Event): Promise<void>{
    this.setState({
      loading: true
    });
    // 判断是加载还是刷新
    let pl: ?Array = null;
    let giftUpdTime: ?number = null;
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
    const data: string = await post(giftUpdTime);
    const data2: Object = JSON.parse(data);
    // 更新列表
    this.props.action.playBackList({
      playBackList: pl.concat(data2.content.reviewList),
      giftUpdTime: data2.content.reviewList[data2.content.reviewList.length - 1].startTime
    });
    this.setState({
      loading: false
    });
    message.success('录播加载成功！');
  }
  render(): Array{
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <label className={ publicStyle.mr10 } htmlFor="playBackDownload-searchInput">搜索已加载列表：</label>
            <Input className={ style.searchInput }
              id="playBackDownload-searchInput"
              ref="playBackDownload-searchInput"
              placeholder="多个关键字用空格分割"
              onPressEnter={ this.onSearchInput.bind(this) }
            />
            <Button className={ publicStyle.mr10 } icon="search" onClick={ this.onSearchInput.bind(this) }>搜索</Button>
            <Button icon="close" onClick={ this.onReset.bind(this) }>重置</Button>
          </div>
          <div className={ publicStyle.fr }>
            <Button type="primary"
              icon="cloud-download-o"
              onClick={ this.onPlayBackListLoad.bind(this, '加载') }
            >
              加载列表
            </Button>
            <Button className={ publicStyle.ml10 } icon="loading-3-quarters" onClick={ this.onPlayBackListLoad.bind(this, '刷新') }>刷新列表</Button>
            <Link to="/PlayBackDownload/List">
              <Button className={ publicStyle.ml10 } icon="bars">下载列表</Button>
            </Link>
            <Link className={ publicStyle.ml10 } to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ publicStyle.tableBox }>
        <Table loading={ this.state.loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): number => item.liveId }
          dataSource={ filter(this.props.playBackList, this.state.keyword, 'title', 0, this.props.playBackList.length - 1) }
          pagination={{
            pageSize: 20,
            showQuickJumper: true,
            current: this.state.current,
            onChange: this.onPageChange.bind(this)
          }}
        />
      </div>
    ];
  }
}

export default PlayBackDownload;