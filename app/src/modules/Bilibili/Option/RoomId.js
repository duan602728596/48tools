/* RoomId查找 */
import React, { Component } from 'react';
import { Input, Button, message } from 'antd';
import $ from 'jquery';
import style from './style.sass';
const url = global.require('url');

class RoomId extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      url: '',
      roomId: ''
    };
  }

  // 复制
  handleCopy(event) {
    const range = document.createRange();

    range.selectNode(document.getElementById('roomId'));
    const selection = window.getSelection();

    if (selection.rangeCount > 0) selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
  }

  // change
  handleChange(event) {
    this.setState({
      url: event.target.value,
      roomId: ''
    });
  }

  // 搜索
  handleSearch(event) {
    const _this = this;
    const u = url.parse(this.state.url);

    if (u.host !== 'live.bilibili.com') {
      message.warn('直播间地址错误！');

      return false;
    }
    const id = this.state.url.split(/\//g);
    const id2 = id[id.length - 1];

    $.ajax({
      url: `https://api.live.bilibili.com/room/v1/Room/room_init?id=${ id2 }`,
      type: 'GET',
      dataType: 'json',
      success(data, status, xhr) {
        if (data.code === 0 && xhr.status === 200) {
          _this.setState({
            roomId: data.data.room_id
          });
        } else {
          message.error(data.msg);
        }
      }
    });
  }

  render() {
    return [
      <h3 key="title" className={ style.title }>RoomId查找</h3>,
      <div key="search" className={ style.group }>
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
      <div key="roomId" className={ style.group }>
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