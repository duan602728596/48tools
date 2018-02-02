/* B站直播间添加 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link, withRouter } from 'react-router-dom';
import { Input, Button, message, Spin, Form } from 'antd';
import style from './style.sass';
import { putBilibiliLiveRoom } from '../store/option';
import RoomId from './RoomId';

/* 初始化数据 */
const state: Function = createStructuredSelector({});

/* dispatch */
const dispatch: Function = (dispatch: Function): Object=>({
  action: bindActionCreators({
    putBilibiliLiveRoom
  }, dispatch)
});

@withRouter
@Form.create()
@connect(state, dispatch)
class BiliBiliOption extends Component{
  state: {
    loading: boolean,
    btnLoading: boolean,
    roomid: string,
    roomname: string
  };
  constructor(): void{
    super(...arguments);

    this.state = {
      loading: false,      // 加载动画
      btnLoading: false,   // 按钮加载动画
      roomid: '',          // 直播间id
      roomname: ''         // 直播间名称
    };
  }
  // 添加
  async onAdd(event: Event): Promise<void>{
    event.preventDefault();
    this.setState({
      loading: true,
      btnLoading: true
    });

    this.props.form.validateFields(async(err: ?any, value: any): Promise<void>=>{
      if(!err){
        const { roomname, roomid }: {
          roomname: string,
          roomid: string
        } = value;

        try{
          await this.props.action.putBilibiliLiveRoom({
            data: {
              roomid: Number(roomid),
              roomname
            }
          });
          message.success('添加成功！');
          this.props.form.resetFields();
        }catch(err){
          message.error('添加失败！');
        }
      }else{
        message.error('添加失败！');
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
        <Form className={ style.form } layout="horizontal" onSubmit={ this.onAdd.bind(this) }>
          <div>
            <Spin spinning={ this.state.loading } tip="加载中...">
              <Form.Item label="直播间名称">
                {
                  getFieldDecorator('roomname', {
                    initialValue: this.state.roomname,
                    rules: [
                      {
                        message: '必须输入直播间名称',
                        required: true,
                        whitespace: true
                      }
                    ]
                  })(
                    <Input />
                  )
                }
              </Form.Item>
              <Form.Item label="直播间ID">
                {
                  getFieldDecorator('roomid', {
                    initialValue: this.state.roomid,
                    rules: [
                      {
                        message: '必须输入直播间ID',
                        required: true,
                        whitespace: true
                      },
                      {
                        message: '必须输入有效的直播间ID',
                        pattern: /^[0-9]+$/i
                      }
                    ]
                  })(
                    <Input />
                  )
                }
              </Form.Item>
              <Form.Item>
                <p className={ style.tishi }>
                  <del>ROOMID查看方式：进入B站直播间 -> 右键 -> 查看源代码 -> 第24行</del>
                  <br />
                  B站直播已改版，ROOMID获取方式如下：
                  <br />
                  https://api.live.bilibili.com/room/v1/Room/room_init?id={ '{{ ID }}' }，GET请求。
                </p>
              </Form.Item>
            </Spin>
          </div>
          <Form.Item>
            <Button className={ style.btn } type="primary" htmlType="submit" size="default" loading={ this.state.btnLoading }>添加</Button>
            <Link to="/BiliBili">
              <Button className={ style.btn } type="danger" size="default" loading={ this.state.btnLoading }>返回</Button>
            </Link>
          </Form.Item>
        </Form>
        <RoomId />
      </div>
    );
  }
}

export default BiliBiliOption;
