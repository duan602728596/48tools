/* 下载列表 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Affix, Progress } from 'antd';
import classNames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import { downloadList, fnReady } from '../store/reducer';
import style from './style.sass';
import publicStyle from '../../../components/publicStyle/publicStyle.sass';
import { handleChromeDownloadsCreated, handleChromeDownloadsChanged } from '../chromeFunction';
const fs = global.require('fs');

/* 初始化数据 */
const getState = ($$state) => $$state.has('playBackDownload')
  ? $$state.get('playBackDownload') : null;

const state = createStructuredSelector({
  downloadList: createSelector( // 下载列表
    getState,
    ($$data) => $$data !== null ? $$data.get('downloadList') : new Map()
  ),
  fnReady: createSelector( // 下载事件监听
    getState,
    ($$data) => $$data !== null ? $$data.get('fnReady') : false
  )
});

/* dispatch */
const dispatch = (dispatch) => ({
  action: bindActionCreators({
    downloadList,
    fnReady
  }, dispatch)
});

class ListOne extends Component {
  static propTypes = {
    detail: PropTypes.array
  };

  constructor() {
    super(...arguments);

    this.state = {
      timer: null, // 定时器
      percent: 0 // 进度条
    };
  }

  componentDidMount() {
    // 进度条的定时器
    const { detail } = this.props;
    const { state } = detail[1];

    if (state && state === 1) {
      this.setState({
        timer: requestAnimationFrame(this.timer.bind(this))
      });
    }
  }

  timer() {
    const { detail } = this.props;
    const { current, infor, state } = detail[1];

    fs.stat(current + '.crdownload', (err, state2) => {
      if (state !== 1) {
        this.setState({
          timer: null,
          percent: 100
        });
      } else {
        const percent = Number((state2.size / infor.totalBytes * 100).toFixed(0));

        this.setState({
          timer: requestAnimationFrame(this.timer.bind(this)),
          percent
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.state.timer) {
      cancelAnimationFrame(this.state.timer);
    }
  }

  stateView() {
    const { detail } = this.props;
    const { state } = detail[1];

    switch (state) {
      case 1:
        return (
          <Button className={ publicStyle.fr }
            type="danger"
            icon="close-square"
            onClick={ this.handleCancelDownload.bind(this, detail[0]) }
          >
            取消下载
          </Button>
        );
      case 2:
        return (
          <div className={ publicStyle.fr }>
            <b className={ style.success }>下载完成</b>
          </div>
        );
      case 3:
        return (
          <div className={ publicStyle.fr }>
            <b className={ style.error }>取消下载</b>
          </div>
        );
      default:
        return null;
    }
  }

  // 取消下载
  handleCancelDownload(id, event) {
    chrome.downloads.cancel(id);
  }

  render() {
    const { detail } = this.props;
    const { current, item, state } = detail[1];

    // 判断文件状态，避免渲染bug
    if (state && state !== 0) {
      const { streamPath, title, subTitle } = item;

      return (
        <div>
          <div className="clearfix">
            <div className={ publicStyle.fl }>
              <p className={ style.line }>【{ title }】{ subTitle }：{ streamPath }</p>
              <p className={ style.line }>{ current }</p>
            </div>
            { this.stateView() }
          </div>
          {
            /* 判断是否显示进度条 */
            state === 1 ? (
              <Progress percent={ this.state.percent } status="active" />
            ) : null
          }
        </div>
      );
    } else {
      return null;
    }
  }
}

@withRouter
@connect(state, dispatch)
class List extends Component {
  static propTypes = {
    downloadList: PropTypes.object,
    fnReady: PropTypes.bool,
    action: PropTypes.objectOf(PropTypes.func),
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  };

  // 组件挂载之前监听chrome下载事件
  componentDidMount() {
    if (this.props.fnReady === false) {
      chrome.downloads.onCreated.addListener(handleChromeDownloadsCreated);
      chrome.downloads.onChanged.addListener(handleChromeDownloadsChanged);
      // 函数已监听的标识
      this.props.action.fnReady({
        fnReady: true
      });
    }
  }

  listOne() {
    return Array.from(this.props.downloadList).map((item, index) => {
      if (item[1].state !== 0) {
        return (
          <li key={ item[0] }>
            <ListOne detail={ item } />
          </li>
        );
      }
    });
  }

  // 清除已下载
  handleClearClick(event) {
    this.props.downloadList.forEach((value, key) => {
      if (value.state !== 1) {
        this.props.downloadList.delete(key);
      }
    });

    this.props.action.downloadList({
      downloadList: new Map(Array.from(this.props.downloadList))
    });
  }

  render() {
    return [
      /* 功能区 */
      <Affix key="affix" className={ publicStyle.affix }>
        <div className={ classNames(publicStyle.toolsBox, 'clearfix') }>
          <div className={ publicStyle.fr }>
            <Button icon="close-square" onClick={ this.handleClearClick.bind(this) }>全部清除</Button>
            <Link to="/PlayBackDownload">
              <Button className={ publicStyle.ml10 } type="danger" icon="poweroff">返回</Button>
            </Link>
          </div>
        </div>
      </Affix>,
      <div key="tableBox" className={ classNames(publicStyle.tableBox, style.detailList) }>
        <QueueAnim component="ul" type="alpha" leaveReverse={ true }>
          { this.listOne() }
        </QueueAnim>
      </div>
    ];
  }
}

export default List;