/* 软件首页 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Row, Col, Icon, Checkbox, Button, message } from 'antd';
import style from './style.sass';
import { test } from '../store/reducer';
import '../../publicMethod/initIndexedDB';
const gui: Object = global.require('nw.gui');

/* 初始化数据 */
const state: Function = createStructuredSelector({
  test: createSelector(
    (state: Immutable.Map): Immutable.Map => state.get('index'),
    (data: Immutable.Map): boolean => data.get('test')
  )
});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    test
  }, dispatch)
});

@connect(state, dispatch)
class Index extends Component{
  static propTypes: Object = {
    test: PropTypes.bool,
    action: PropTypes.objectOf(PropTypes.func)
  };

  constructor(): void{
    super(...arguments);
  }
  // check
  onCheckChange(event: Event): void{
    this.props.action.test({
      test: event.target.checked
    });
  }
  // 清除缓存
  onClearCache(event: Event): void{
    gui.App.clearCache();
    message.success('缓存清除成功！');
  }
  render(): React.Element{
    return (
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
        <div className={ style.test }>
          <Checkbox checked={ this.props.test } onChange={ this.onCheckChange.bind(this) }>
            <span>显示测试功能。（某些功能正在测试，功能不稳定）</span>
          </Checkbox>
          <Button className={ style.clearCache } onClick={ this.onClearCache.bind(this) }>清除缓存</Button>
        </div>
        <Row type="flex" align="top" justify="start">
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/LiveCatch" title="口袋48直播抓取">
                  <img src={ require('../image/hty1.jpg') } alt="口袋48直播抓取" />
                </Link>
              </dt>
              <dd>
                <Link to="/LiveCatch">直播抓取</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/PlayBackDownload" title="口袋48录播下载">
                  <img src={ require('../image/xsy1.jpg') } alt="口袋48录播下载" />
                </Link>
              </dt>
              <dd>
                <Link to="/PlayBackDownload">录播下载</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/BiliBili" title="B站直播抓取">
                  <img src={ require('../image/lyy1.jpg') } alt="B站直播抓取" />
                </Link>
              </dt>
              <dd>
                <Link to="/BiliBili">B站直播抓取</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/Cut" title="视频剪切">
                  <img src={ require('../image/lxh1.jpg') } alt="视频剪切" />
                </Link>
              </dt>
              <dd>
                <Link to="/Cut">视频剪切</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/MergeVideo" title="视频合并">
                  <img src={ require('../image/tsl1.jpg') } alt="视频合并" />
                </Link>
              </dt>
              <dd>
                <Link to="/MergeVideo">视频合并</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/MoDian" title="摩点项目集资统计">
                  <img src={ require('../image/llf1.jpg') } alt="摩点项目集资统计" />
                </Link>
              </dt>
              <dd>
                <Link to="/MoDian">摩点项目集资统计</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/LiveDownload" title="公演录播下载">
                  <img src={ require('../image/zmh1.jpg') } alt="公演录播下载" />
                </Link>
              </dt>
              <dd>
                <Link to="/LiveDownload">公演录播下载</Link>
              </dd>
            </dl>
          </Col>
          <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
            <dl className={ style.linkGroup }>
              <dt className={ style.bPro }>
                <Link to="/InLive48" title="公演官方直播抓取">
                  <img src={ require('../image/rxy1.jpg') } alt="公演官方直播抓取" />
                </Link>
              </dt>
              <dd>
                <Link to="/InLive48">公演官方直播抓取</Link>
              </dd>
            </dl>
          </Col>
          {
            do{
              if(this.props.test){
                (
                  <Col xl={ 4 } lg={ 4 } md={ 6 } sm={ 8 } xs={ 12 }>
                    <dl className={ style.linkGroup }>
                      <dt className={ style.bNext }>
                        <Link to="/AvDownload" title="B站视频下载">
                          <img src={ require('../image/ler1.jpg') } alt="B站视频下载" />
                        </Link>
                      </dt>
                      <dd>
                        <Link to="/AvDownload">B站视频下载</Link>
                      </dd>
                    </dl>
                  </Col>
                );
              }
            }
          }
        </Row>
      </div>
    );
  }
}

export default Index;