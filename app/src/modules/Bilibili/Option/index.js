/* B站直播间添加 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Input, Button, message, Spin } from 'antd';
import style from './style.sass';
import { putBilibiliLiveRoom } from '../store/option';

/* 初始化数据 */
const state = createStructuredSelector({});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    putBilibiliLiveRoom
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class BiliBiliOption extends Component{
  constructor(props){
    super(props);

    this.state = {
      loading: false,      // 加载动画
      btnLoading: false,   // 按钮加载动画
      roomid: '',          // 直播间id
      roomname: ''         // 直播间名称
    };
  }
  // 表单的change事件
  onInputChange(key, event){
    this.setState({
      [key]: event.target.value
    });
  }
  // 添加
  async onAdd(event){
    this.setState({
      loading: true,
      btnLoading: true
    });
    try{
      await this.props.action.putBilibiliLiveRoom({
        data: {
          roomid: Number(this.state.roomid),
          roomname: this.state.roomname
        }
      });
      message.success('添加成功！');
      this.setState({
        loading: false,
        btnLoading: false,
        roomid: '',
        roomname: ''
      });
    }catch(err){
      message.error('添加失败！');
      this.setState({
        loading: false,
        btnLoading: false
      });
    }
  }
  render(){
    return(
      <div className={ style.body }>
        <Spin spinning={ this.state.loading } tip="加载中...">
          <div className={ style.formGroup }>
            <label className={ style.formLabel } htmlFor="BiliBili-roomname">直播间名称：</label>
            <Input className={ style.input }
                   id="BiliBili-roomname"
                   value={ this.state.roomname }
                   onChange={ this.onInputChange.bind(this, 'roomname') } />
          </div>
          <div className={ style.formGroup }>
            <label className={ style.formLabel } htmlFor="BiliBili-roomid">直播间ID：</label>
            <Input className={ style.input }
                   id="BiliBili-roomid"
                   value={ this.state.roomid }
                   onChange={ this.onInputChange.bind(this, 'roomid') } />
            <p className={ style.tishi }>ROOMID查看方式：进入B站直播间 -> 右键 -> 查看源代码 -> 第24行</p>
          </div>
        </Spin>
        <div>
          <Button className={ style.btn } type="primary" loading={ this.state.btnLoading } onClick={ this.onAdd.bind(this) }>添加</Button>
          <Link to="/BiliBili">
            <Button className={ style.btn } type="danger" loading={ this.state.btnLoading }>
              <span>返回</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default BiliBiliOption;
