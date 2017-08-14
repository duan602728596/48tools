// @flow
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
const state: Object = createStructuredSelector({});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    getAutoRecordingOption,
    addAutoRecordingOption,
    putAutoRecordingOption
  }, dispatch)
});

@withRouter
@connect(state, dispatch)
class LiveCatchOption extends Component{
  state: {
    loading: boolean,
    btnLoading: boolean,
    time: string,
    humans: string
  };
  constructor(props: ?Object): void{
    super(props);

    this.state = {
      loading: true,      // 加载动画
      btnLoading: false,  // 按钮加载动画
      time: '',           // 间隔时间
      humans: ''          // 成员
    };
  }
  async componentWillMount(): void{
    const data: Object = await this.props.action.getAutoRecordingOption({
      data: 'liveCatchOption'
    });
    let time: ?number = null,
      humans: ?string[] = null;
    if(data){
      [time, humans] = [data.option.time, data.option.humans];
    }else{
      // 初始化数据
      [time, humans] = [1, []];
      await this.props.action.addAutoRecordingOption({
        data: {
          function: 'liveCatchOption',
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
  onInputChange(key: string, event: Object): void{
    this.setState({
      [key]: event.target.value
    });
  }
  // 修改
  async onRevise(event: Object): void{
    this.setState({
      loading: true,
      btnLoading: true
    });
    // 整理数据
    const humans: string = this.state.humans;
    const humansArray: Array = humans.split(/\s*,\s*/);
    for(let j: number = humansArray.length - 1; j >= 0; j--){
      if(humansArray[j] === ''){
        humansArray.splice(j, 1);
      }
    }
    // 修改配置
    try{
      await this.props.action.putAutoRecordingOption({
        data: {
          function: 'liveCatchOption',
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
  render(): Object{
    return(
      <div className={ style.body }>
        <Spin spinning={ this.state.loading } tip="加载中...">
          <div className={ style.formGroup }>
            <label className={ style.formLabel } htmlFor="liveCatch-time">请输入请求间隔时间（分）：</label>
            <Input className={ style.input }
                   id="liveCatch-time"
                   value={ this.state.time }
                   onChange={ this.onInputChange.bind(this, 'time') } />
          </div>
          <div className={ style.formGroup }>
            <label className={ style.formLabel } htmlFor="liveCatch-humans">请输入想要监控的成员，以","分割，没有配置则为全部：</label>
            <Input.TextArea className={ style.input }
                            id="liveCatch-humans"
                            rows={ 10 }
                            value={ this.state.humans }
                            onChange={ this.onInputChange.bind(this, 'humans') } />
          </div>
        </Spin>
        <div>
          <Button className={ style.btn } type="primary" loading={ this.state.btnLoading } onClick={ this.onRevise.bind(this) }>修改</Button>
          <Link to="/LiveCatch">
            <Button className={ style.btn } type="danger" loading={ this.state.btnLoading }>
              <span>返回</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}

export default LiveCatchOption;
