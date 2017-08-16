// @flow
/* 软件首页 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col, Icon, Checkbox, Button, message } from 'antd';
import style from './style.sass';
import { test } from './store/reducer';
import '../pubmicMethod/initIndexedDB';
const gui = global.require('nw.gui');

/* 初始化数据 */
const state: Object = createStructuredSelector({
  test: createSelector(
    (state: Object): boolean=>state.get('index').get('test'),
    (data: boolean): boolean=>data
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    test
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class Index extends Component{
  constructor(props: ?Object): void{
    super(props);
  }
  // check
  onCheckChange(event: Object): void{
    this.props.action.test({
      test: event.target.checked
    });
  }
  // 清除缓存
  onClearCache(event: Object): void{
    gui.App.clearCache();
    message.success('缓存清除成功！');
  }
  render(): Object{
    return(
      <div className={ style.body }>
        <h1 className={ style.title }>48应援工具</h1>
        <p className={ style.text }>
          本软件遵循
          <b>GNU General Public License v3.0</b>
          许可证，非商用，如有问题请发送到邮箱duanhaochen@126.com。
        </p>
        <p className={ style.text }>
          源代码托管地址：
          <Icon type="github" />
          <span className={ style.url }>https://github.com/duan602728596/48tools</span>
          。
        </p>
        <p className={ style.text }>
          图片来自
          <b>SNH48</b>
          、
          <b>BEJ48</b>
          的成员，都是我的推，请给我的推集资吧……
        </p>
        <div className={ style.test }>
          <label>
            <Checkbox checked={ this.props.test } onChange={ this.onCheckChange.bind(this) } />
            <span>显示测试功能。（某些功能正在测试，功能不稳定）</span>
          </label>
          <Button className={ style.clearCache } onClick={ this.onClearCache.bind(this) }>清除缓存</Button>
        </div>
        <Row type="flex" align="top" justify="start">
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/LiveCatch" title="口袋48直播抓取">
                  <img src={ require('./image/hty1.jpg') } alt="口袋48直播抓取" />
                </Link>
              </dt>
              <dd>
                <Link to="/LiveCatch">直播抓取</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/PlayBackDownload" title="口袋48录播下载">
                  <img src={ require('./image/xsy1.jpg') } alt="口袋48录播下载" />
                </Link>
              </dt>
              <dd>
                <Link to="/PlayBackDownload">录播下载</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/BiliBili" title="B站直播抓取">
                  <img src={ require('./image/lyy1.jpg') } alt="B站直播抓取" />
                </Link>
              </dt>
              <dd>
                <Link to="/BiliBili">B站直播抓取</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/Cut" title="视频剪切">
                  <img src={ require('./image/lxh1.jpg') } alt="视频剪切" />
                </Link>
              </dt>
              <dd>
                <Link to="/Cut">视频剪切</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bTest }>
                <Link to="/Cut" title="微打赏统计">
                  <img src={ require('./image/llf1.jpg') } alt="微打赏统计" />
                </Link>
              </dt>
              <dd>
                <Link to="/Cut">微打赏统计</Link>
              </dd>
            </dl>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Index;