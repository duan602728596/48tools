/* B站直播抓取 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Button, Table, Icon, Affix, message } from 'antd';
import { getliveList, putliveList } from '../store/render';
import publicStyle from '../../pubmicMethod/public.sass';
import commonStyle from '../../../common.sass';
const child_process = global.require('child_process');
const path = global.require('path');
const process = global.require('process');
const __dirname = path.dirname(process.execPath).replace(/\\/g, '/');

/* 初始化数据 */
const state = createStructuredSelector({
  liveList: createSelector(         // 当前直播列表
    (state)=>state.get('bilibili').get('liveList'),
    (data)=>data
  )
});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    getliveList,
    putliveList
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class BiliBili extends Component{
  render(){
    return(
      <div>
        {/* 功能区 */}
        <Affix>
          <div className={ `${ publicStyle.toolsBox } ${ commonStyle.clearfix }` }>
            <div className={ publicStyle.fl }>
              <Link to="/">
                <Button type="primary">
                  <Icon type="setting" />
                  <span>添加B站直播间</span>
                </Button>
              </Link>
            </div>
            <div className={ publicStyle.fr }>
              <Link to="/">
                <Button className={ publicStyle.ml10 } type="danger">
                  <Icon type="poweroff" />
                  <span>返回</span>
                </Button>
              </Link>
            </div>
          </div>
        </Affix>
      </div>
    );
  }
}

export default BiliBili;