/* RoomId查找 */
import React, { Component } from 'react';
import { Input, Button, message } from 'antd';
import $ from 'jquery';
import style from './style.sass';
const url: Object = global.require('url');

class RoomId extends Component{
  state: {
    url: string,
    roomId: string
  };

  constructor(): void{
    super(...arguments);

    this.state = {
      url: '',
      roomId: ''
    };
  }
  // 复制
  handleCopy(event: Event): void{
    const range: Object = document.createRange();
    range.selectNode(document.getElementById('roomId'));
    const selection: Object = window.getSelection();
    if(selection.rangeCount > 0) selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
  }
  // change
  handleChange(event: Event): void{
    this.setState({
      url: event.target.value,
      roomId: ''
    });
  }
  // 搜索
  handleSearch(event: Event): void{
    const _this: this = this;
    const u: Object = url.parse(this.state.url);
    if(u.host !== 'live.bilibili.com'){
      message.warn('直播间地址错误！');
      return false;
    }
    const id: string[] = this.state.url.split(/\//g);
    const id2: string = id[id.length - 1];
    $.ajax({
      url: `https://api.live.bilibili.com/room/v1/Room/room_init?id=${ id2 }`,
      type: 'GET',
      dataType: 'json',
      success(data: Object, status: string, xhr: XMLHttpRequest): void{
        if(data.code === 0 && xhr.status === 200){
          _this.setState({
            roomId: data.data.room_id
          });
        }else{
          message.error(data.msg);
        }
      }
    });
  }
  render(): Array{
    return [
      <h3 key={ 0 } className={ style.title }>RoomId查找</h3>,
      <div key={ 1 } className={ style.group }>
        <label className={ style.label } htmlFor="roomUrl">直播间地址：</label>
        <Input className={ style.input }
          id="roomUrl"
          placeholder="输入B站的直播间地址"
          value={ this.state.url }
          onChange={ this.handleChange.bind(this) }
          suffix={
            <Button className={ style.ipb } type="primary" title="搜索" icon="share-alt" onClick={ this.handleSearch.bind(this) } />
          }
        />
      </div>,
      <div key={ 2 } className={ style.group }>
        <label className={ style.label } htmlFor="roomId">RoomID：</label>
        <Input className={ style.input }
          id="roomId"
          readOnly={ true }
          value={ this.state.roomId }
          suffix={
            <Button className={ style.ipb } type="primary" title="复制" icon="copy" onClick={ this.handleCopy.bind(this) } />
          }
        />
      </div>
    ];
  }
}

export default RoomId;