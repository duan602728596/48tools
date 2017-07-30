/* 口袋48直播抓取配置页面 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import style from './style.sass';
import IndexedDB from '../../pubmicMethod/IndexedDB';

class LiveCacheOption extends Component{
  constructor(props){
    super(props);
  }
  render(){
    return(
      <div className={ style.body }>
        <div className={ style.formGroup }>
          <label className={ style.formLabel }>请输入请求间隔时间（分）：</label>
          <Input className={ style.input } />
        </div>
        <div className={ style.formGroup }>
          <label className={ style.formLabel }>请输入想要监控的成员，以","分割：</label>
          <Input.TextArea className={ style.input } rows={ 10 } />
        </div>
        <div>
          <Button className={ style.btn } type="primary">修改</Button>
          <Button className={ style.btn } type="danger">
            <Link to="/LiveCache">返回</Link>
          </Button>
        </div>
      </div>
    );
  }
}

export default LiveCacheOption;
