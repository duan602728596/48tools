/* 直播视频下载 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Button, Table, Affix, message, Select } from 'antd';
import { liveList, liveListInit, changeGroup } from '../store/index';
import { downloadList } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../publicMethod/public.sass';
import { loadList, queryHtml, getM3U8, downloadM3U8, saveM3U8 } from './loadList';
import { time } from '../../../function';
import { child_process_stdout, child_process_stderr, child_process_exit, child_process_error } from './child_process';
import option from '../../publicMethod/option';
const child_process = node_require('child_process');

/* 初始化数据 */
const getIndex: Function = ($$state: Immutable.Map): ?Immutable.Map => $$state.has('liveDownload') ? $$state.get('liveDownload').get('index') : null;

const state: Function = createStructuredSelector({
  liveList: createSelector(         // 当前公演录播列表
    getIndex,
    ($$data: ?Immutable.Map): Array => $$data !== null && $$data.has('liveList') ? $$data.get('liveList') : []
  ),
  page: createSelector(             // 当前页码
    getIndex,
    ($$data: ?Immutable.Map): number => $$data !== null && $$data.has('page') ? $$data.get('page') : 1
  ),
  pageLen: createSelector(          // 当前页数
    getIndex,
    ($$data: ?Immutable.Map): number => $$data !== null && $$data.has('pageLen') ? $$data.get('pageLen') : 1
  ),
  group: createSelector(
    getIndex,                       // 选择团
    ($$data: ?Immutable.Map): string => $$data !== null && $$data.has('group') ? $$data.get('group') : 'SNH48'
  ),
  downloadList: createSelector(     // 下载列表
    ($$state: Immutable.Map): ?Immutable.Map => $$state.has('liveDownload') ? $$state.get('liveDownload') : null,
    ($$data: ?Immutable.Map): Array=>{
      const downloadList: Immutable.List | Array = $$data !== null ? $$data.get('downloadList') : [];
      return downloadList instanceof Array ? downloadList : downloadList.toJS();
    }
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    liveList,
    liveListInit,
    changeGroup,
    downloadList
  }, dispatch)
});

@connect(state, dispatch)
class LiveDownload extends Component{
  state: {
    loading: boolean
  };
  constructor(): void{
    super(...arguments);

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
          return (
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
        render: (text: any, item: Object): Array=>{
          return [
            <Button key={ 0 } className={ publicStyle.mr10 } onClick={ this.onDownload.bind(this, item, 'chao') }>超清</Button>,
            <Button key={ 1 } className={ publicStyle.mr10 } onClick={ this.onDownload.bind(this, item, 'gao') }>高清</Button>,
            <Button key={ 2 } onClick={ this.onDownload.bind(this, item, 'liuchang') }>流畅</Button>
          ];
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
  async onLoadList(page: number, pageSize: number, event: Event): void{
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
  // 公演下载
  async onDownload(item: Object, quality: string, event: Event): void{
    try{
      const m3u8Url: string = await getM3U8(this.props.group, item.id, quality);   // m3u8地址
      const dlm: string = await downloadM3U8(m3u8Url);                             // m3u8文本
      const title: string = `【公演】${ item.id }_${ item.title }_${ item.secondTitle }_${ time('YY-MM-DD_hh-mm-ss') }`.replace(/\s/g, '');
      const pSave: string = await saveM3U8(title, dlm);                            // m3u8本地保存路径
      const child: Object = child_process.spawn(option.ffmpeg, [
        `-protocol_whitelist`,
        `file,http,https,tcp,tls`,
        `-i`,
        `${ pSave }`,
        `-acodec`,
        `copy`,
        `-vcodec`,
        `copy`,
        `-f`,
        `mp4`,
        `${ option.output }/${ title }.mp4`
      ]);
      child.stdout.on('data', child_process_stdout);
      child.stderr.on('data', child_process_stderr);
      child.on('close', child_process_exit);
      child.on('error', child_process_error);

      this.props.downloadList.push({
        id: new Date().getTime(),
        item,
        pSave,
        child
      });
      this.props.action.downloadList({
        downloadList: this.props.downloadList.slice()
      });
      message.info('正在下载！');
    }catch(err){
      console.log(err);
      message.error('下载失败！');
    }
  }
  render(): Array{
    return [
      /* 功能区 */
      <Affix key={ 0 } className={ publicStyle.affix }>
        <div className={ `${ publicStyle.toolsBox } clearfix` }>
          <div className={ publicStyle.fl }>
            <Select className={ style.select }
              value={ this.props.group }
              dropdownMatchSelectWidth={ true }
              dropdownClassName={ style.select }
              onSelect={ this.onGroupSelect.bind(this) }
            >
              <Select.Option key="SNH48" value="SNH48">SNH48</Select.Option>
              <Select.Option key="BEJ48" value="BEJ48">BEJ48</Select.Option>
              <Select.Option key="GNZ48" value="GNZ48">GNZ48</Select.Option>
              <Select.Option key="SHY48" value="SHY48">SHY48</Select.Option>
              <Select.Option key="CKG48" value="CKG48">CKG48</Select.Option>
            </Select>
            <Button className={ publicStyle.ml10 } type="primary" icon="cloud" onClick={ this.onLoadList.bind(this, 1, 15) }>刷新公演录播列表</Button>
          </div>
          <div className={ publicStyle.fr }>
            <Link to="/LiveDownload/List">
              <Button className={ publicStyle.mr10 } icon="bars">下载列表</Button>
            </Link>
            <Link to="/">
              <Button type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      /* 显示列表 */
      <div key={ 1 } className={ `${ publicStyle.tableBox } ${ style.tableBox }` }>
        <Table loading={ this.state.loading }
          bordered={ true }
          columns={ this.columus() }
          rowKey={ (item: Object): number => item.id }
          dataSource={ this.props.liveList }
          pagination={{
            pageSize: 15,
            showQuickJumper: true,
            current: this.props.page,
            total: this.props.liveList.length === 0 ? 0 : this.props.pageLen * 15,
            onChange: this.onLoadList.bind(this)
          }}
        />
      </div>
    ];
  }
}

export default LiveDownload;