/* 口袋48直播抓取配置页面 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Input, Button, message, Spin, Form } from 'antd';
import style from './style.sass';
import { getAutoRecordingOption, addAutoRecordingOption, putAutoRecordingOption } from '../store/reducer';

/* 初始化数据 */
const state: Function = createStructuredSelector({});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    getAutoRecordingOption,
    addAutoRecordingOption,
    putAutoRecordingOption
  }, dispatch)
});

@withRouter
@Form.create()
@connect(state, dispatch)
class LiveCatchOption extends Component{
  state: {
    loading: boolean,
    btnLoading: boolean,
    time: number,
    humans: string
  };
  constructor(props: ?Object): void{
    super(props);

    this.state = {
      loading: true,      // 加载动画
      btnLoading: false,  // 按钮加载动画
      time: null,         // 间隔时间
      humans: null        // 成员
    };
  }
  async componentWillMount(): void{
    const qr: Object = await this.props.action.getAutoRecordingOption({
      query: 'liveCatchOption'
    });
    const data: Object = qr.result;
    let time: ?number = null,
      humans: ?string[] = null;
    if(data){
      [time, humans] = [data.option.time, data.option.humans];
      this.setState({
        time: time,
        humans: humans.join(', '),
        loading: false
      });
    }else{
      this.setState({
        loading: false
      });
    }
  }
  // 修改
  onRevise(event: Object): void{
    event.preventDefault();
    this.setState({
      loading: true,
      btnLoading: true
    });
    this.props.form.validateFields(async (err: ?any, value: any): void=>{
      if(!err){
        const { time, humans }: {
          time: string,
          humans: ?string
        } = value;

        const humansArray: Array = (humans ? humans : '').replace(/\s+/g, '').split(/\s*,\s*/g);
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
                time: Number(time),
                humans: humansArray
              }
            }
          });
          message.success('配置修改成功！');
        }catch(err){
          message.error('配置修改失败！');
        }
      }else{
        message.error('配置修改失败！');
      }
      this.setState({
        loading: false,
        btnLoading: false
      });
    });
  }
  render(): Object{
    const { getFieldDecorator }: { getFieldDecorator: Function } = this.props.form;  // 包装表单控件
    return (
      <div className={ style.body }>
        <Form layout="horizontal" onSubmit={ this.onRevise.bind(this) }>
          <div>
            <Spin spinning={ this.state.loading }>
              <Form.Item label={
                <span>
                  请输入请求间隔时间（分）
                  <span className={ style.red }>（时间大于等于一分钟）</span>
                </span>
              }>
                {
                  getFieldDecorator('time', {
                    initialValue: this.state.time,
                    rules: [
                      {
                        message: '必须输入请求间隔时间',
                        required: true,
                        whitespace: true,
                      },
                      {
                        message: '时间必须大于等于一分钟',
                        type: 'number',
                        min: 1,
                        transform: (value: string): number=>Number(value)
                      }
                    ]
                  })(
                    <Input />
                  )
                }
              </Form.Item>
              <Form.Item label={
                <span>请输入想要监控的成员，以","分割，没有配置则为全部</span>
              }>
                {
                  getFieldDecorator('humans', {
                    initialValue: this.state.humans
                  })(
                    <Input.TextArea rows={ 10 } />
                  )
                }
              </Form.Item>
            </Spin>
          </div>
          <Form.Item>
            <Button className={ style.btn } type="primary" htmlType="submit" size="default" loading={ this.state.btnLoading }>修改</Button>
            <Link to="/LiveCatch">
              <Button className={ style.btn } type="danger" size="default" loading={ this.state.btnLoading }>返回</Button>
            </Link>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default LiveCatchOption;
