import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Affix, Button, Input, Table, message, Popconfirm } from 'antd';
import classNames from 'classnames';
import $ from 'jquery';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import style from './style.sass';
import { avList } from '../store/reducer';
import option from '../../../components/option/option';
const cheerio = global.require('cheerio');
const request = global.require('request');
const fs = global.require('fs');
const path = global.require('path');

/* 初始化数据 */
const state = createStructuredSelector({
  avList: createSelector( // B站视频下载列表
    ($$state) => $$state.has('avDownload') ? $$state.get('avDownload') : null,
    ($$data) => $$data !== null ? $$data.get('avList').toJS() : []
  )
});

/* dispatch */
const dispatch = (dispatch) => ({
  action: bindActionCreators({
    avList
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component {
  static propTypes = {
    avList: PropTypes.array,
    action: PropTypes.objectOf(PropTypes.func)
  };

  // 配置
  columus() {
    const columus = [
      {
        title: 'av号',
        key: 'number',
        dataIndex: 'number'
      },
      {
        title: 'page',
        key: 'page',
        dataIndex: 'page'
      },
      {
        title: '视频地址',
        key: 'uri',
        dataIndex: 'uri',
        width: '500px',
        render: (value, item, index) => <div className={ style.uri }>{ value }</div>
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: (value, item, index) => {
          switch (value) {
            case 0:
              return <span className={ style.status0 }>未下载</span>;
            case 1:
              return <span className={ style.status1 }>下载中</span>;
            case 2:
              return <span className={ style.status2 }>已完成</span>;
            case 3:
              return <span className={ style.status3 }>下载失败</span>;

          }
        }
      },
      {
        title: '操作',
        dataIndex: 'handle',
        width: '20%',
        render: (value, item, index) => {
          const isLoading = item.status === 1;

          return [
            <Button key="download"
              className={ publicStyle.mr10 }
              type="primary"
              icon="video-camera"
              loading={ isLoading }
              onClick={ this.handleDownloadFlvClick.bind(this, item, index) }
            >
              下载
            </Button>,
            <Popconfirm key="delete" title="确认要删除吗？" onConfirm={ this.handleDeleteClick.bind(this, item, index) }>
              <Button type="danger" icon="delete" loading={ isLoading }>删除</Button>
            </Popconfirm>
          ];
        }
      }
    ];

    return columus;
  }

  // 删除
  handleDeleteClick(item, index, event) {
    this.props.avList.splice(index, 1);
    this.props.action.avList({
      avList: this.props.avList
    });
  }

  // 下载
  async handleDownloadFlvClick(item, index, event) {
    this.props.avList[index].status = 1;
    this.props.action.avList({
      avList: this.props.avList
    });
    try {
      const data = await this.downloadFlv(item.uri, item.number);

      fs.writeFile(path.join(option.output, `av${ item.number }_${ item.page }_${ item.index }_${ item.time }.flv`), data, (err) => {
        if (err) {
          message.error('视频下载失败！');
          this.props.avList[index].status = 3;
        } else {
          message.success('视频下载成功！');
          this.props.avList[index].status = 2;
        }
        this.props.action.avList({
          avList: this.props.avList
        });
      });
    } catch (err) {
      console.error(err);
      message.error('视频下载失败！');
      this.props.avList[index].status = 3;
      this.props.action.avList({
        avList: this.props.avList
      });
    }
  }

  // 获取下载地址
  getUrl(number, page) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://www.bilibili.com/video/av${ number }/?p=${ page }`,
        method: 'GET',
        success(data, status, xhr) {
          const xml = cheerio.load(data);
          const scripts = xml('script');
          let infor = null; // 视频地址：infor.durl[0].url

          for (let i = 0, j = scripts.length; i < j; i++) {
            const children = scripts[i].children;

            // 获取 window.__playinfo__ 信息
            if (children.length > 0 && /^window\._{2}playinfo_{2}=.+$/.test(children[0].data)) {
              infor = JSON.parse(children[0].data.replace(/window\.__playinfo__=/, ''));
              break;
            }
          }
          resolve(infor?.data?.durl || []);
        },
        error(err) {
          reject(err);
        }
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  // 下载
  downloadFlv(uri, number) {
    return new Promise((resolve, reject) => {
      request({
        uri,
        method: 'GET',
        headers: {
          referer: `https://www.bilibili.com/video/av${ number }/`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) '
                      + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
          Range: 'bytes=0-'
        },
        encoding: null
      }, (err, res, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  // 抓取页面
  handleGetPageClick = async (event) => {
    try {
      const $avNumber = $('#av-number');
      const $avPage = $('#av-page');
      const number = $avNumber.val();
      let page = $avPage.val();

      if (!/^[0-9]+$/.test(number)) {
        message.info('请输入av号！');

        return void 0;
      }

      if (!/^[0-9]+$/.test(page)) {
        page = 1;
      }

      const durl = await this.getUrl(number, page);

      if (durl.length === 0) {
        message.info('视频不存在！');

        return void 0;
      }

      const arr = [];

      for (let i = 0, j = durl.length; i < j; i++) {
        const item = durl[i];

        arr.push({
          number,
          page,
          index: i,
          uri: item.url,
          time: new Date().getTime(),
          status: 0
        });
      }

      const avList = this.props.avList;

      avList.push(...arr);
      this.props.action.avList({ avList });
      message.success('获取地址成功！');
      $avNumber.val('');
      $avPage.val('');
    } catch (err) {
      console.error(err);
      message.error('获取地址失败！');
    }
  };
  
  render() {
    const { avList } = this.props;

    return (
      <Fragment>
        {/* 功能区 */}
        <Affix className={ publicStyle.affix }>
          <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
            <div className={ publicStyle.fl }>
              <label htmlFor="av-number">av号: </label>
              <Input className={ classNames(publicStyle.mr10, style.input) } id="av-number" />
              <label htmlFor="av-page">视频page: </label>
              <Input className={ classNames(publicStyle.mr10, style.page) } id="av-page" />
              <Button type="primary" icon="down-square" onClick={ this.handleGetPageClick }>添加队列</Button>
            </div>
            <div className={ publicStyle.fr }>
              <Link to="/">
                <Button type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
        <div className={ publicStyle.tableBox }>
          <Table bordered={ true }
            size="small"
            columns={ this.columus() }
            rowKey={ (item) => item.time }
            dataSource={ avList }
            pagination={{
              pageSize: avList.length
            }}
          />
        </div>
      </Fragment>
    );
  }
}

export default Index;