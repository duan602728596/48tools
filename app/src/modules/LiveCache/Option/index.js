/* 口袋48直播抓取配置页面 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Input, Button, message, Spin } from 'antd';
import style from './style.sass';
import { getAutoRecordingOption, addAutoRecordingOption, putAutoRecordingOption } from '../store/reducer';

/* 初始化数据 */
const state = createStructuredSelector({});

/* dispatch */
const dispatch = (dispatch)=>({
  action: bindActionCreators({
    getAutoRecordingOption,
    addAutoRecordingOption,
    putAutoRecordingOption
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class LiveCacheOption extends Component{
  constructor(props){
    super(props);

    this.state = {
      loading: true,      // 加载动画
      btnLoading: false,  // 按钮加载动画
      time: '',           // 间隔时间
      humans: ''          // 成员
    };
  }
  async componentWillMount(){
    const data = await this.props.action.getAutoRecordingOption({
      data: 'liveCacheOption'
    });
    let time = null,
      humans = null;
    if(data){
      [time, humans] = [data.option.time, data.option.humans];
    }else{
      // 初始化数据
      [time, humans] = [1, []];
      await this.props.action.addAutoRecordingOption({
        data: {
          function: 'liveCacheOption',
          option: {
            time,
            humans
          }
        }
      });
    }
    this.setState({
      time: time,
      humans: humans.join(', '),
      loading: false
    });
  }
  // 表单的change事件
  onInputChange(key, event){
    this.setState({
      [key]: event.target.value
    });
  }
  // 修改
  async onRevise(event){
    this.setState({
      loading: true,
      btnLoading: true
    });
    // 整理数据
    const humans = this.state.humans.slice();
    const humansArray = humans.split(/\s*,\s*/);
    for(let j = humansArray.length - 1; j >= 0; j--){
      if(humansArray[j] === ''){
        humansArray.splice(j, 1);
      }
    }
    // 修改配置
    try{
      await this.props.action.putAutoRecordingOption({
        data: {
          function: 'liveCacheOption',
          option: {
            time: Number(this.state.time),
            humans: humansArray
          }
        }
      });
      message.success('配置修改成功！');
    }catch(err){
      message.error('配置修改失败！');
    }
    this.setState({
      loading: false,
      btnLoading: false
    });
  }
  render(){
    return(
      <div className={ style.body }>
        <Spin spinning={ this.state.loading } tip="加载中...">
          <div className={ style.formGroup }>
            <label className={ style.formLabel } htmlFor="liveCache-time">请输入请求间隔时间（分）：</label>
            <Input className={ style.input }
                   id="liveCache-time"
                   value={ this.state.time }
                   onChange={ this.onInputChange.bind(this, 'time') } />
          </div>
          <div className={ style.formGroup }>
            <label className={ style.formLabel } htmlFor="liveCache-humans">请输入想要监控的成员，以","分割，没有配置则为全部：</label>
            <Input.TextArea className={ style.input }
                            id="liveCache-humans"
                            rows={ 10 }
                            value={ this.state.humans }
                            onChange={ this.onInputChange.bind(this, 'humans') } />
          </div>
        </Spin>
        <div>
          <Button className={ style.btn } type="primary" loading={ this.state.btnLoading } onClick={ this.onRevise.bind(this) }>修改</Button>
          <Link to="/LiveCache">
            <Button className={ style.btn } type="danger" loading={ this.state.btnLoading }>
              <span>返回</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default LiveCacheOption;
