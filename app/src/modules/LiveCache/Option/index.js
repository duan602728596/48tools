/* 口袋48直播抓取配置页面 */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Input, Button, message, Spin } from 'antd';
import style from './style.sass';
import publicStyle from '../../pubmicMethod/public.sass';
import IndexedDB from '../../pubmicMethod/IndexedDB';
import option from '../../pubmicMethod/option';

@withRouter
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
  componentWillMount(){
    const _this = this;
    // 从数据库里获取默认配置
    IndexedDB(option.indexeddb.name, option.indexeddb.version, {
      success: function(event){
        const store = this.getObjectStore('liveCache', true);
        const _this2 = this;
        store.get('liveCacheOption', function(result){
          if(result){
            const { time, humans } = result.option;
            _this.setState({
              loading: false,
              time: String(time),
              humans: humans.join(', ')
            });
          }else{
            // 将默认数据存到数据库
            store.add({
              function: 'liveCacheOption',
              option: {
                time: 1,
                humans: []
              }
            });
            _this.setState({
              loading: false,
              time: '1'
            });
          }
          _this2.close();
        });
      }
    });
  }
  // 表单的change事件
  onInputChange(key, event){
    this.setState({
      [key]: event.target.value
    });
  }
  // 修改
  onRevise(event){
    const _this = this;
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
    IndexedDB(option.indexeddb.name, option.indexeddb.version, {
      success: function(event){
        const store = this.getObjectStore('liveCache', true);
        store.put({
          function: 'liveCacheOption',
          option: {
            time: Number(_this.state.time),
            humans: humansArray
          }
        });
        this.close();
        _this.setState({
          loading: false,
          btnLoading: false
        });
        message.success('配置修改成功！');
      }
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
          <Button className={ `${ style.btn } ${ publicStyle.btn }` } type="danger" loading={ this.state.btnLoading }>
            <span>返回</span>
            <Link className={ publicStyle.btnLink } to="/LiveCache" />
          </Button>
        </div>
      </div>
    );
  }
}

export default LiveCacheOption;
