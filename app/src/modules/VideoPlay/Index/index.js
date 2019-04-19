/**
 * 新窗口播放视频
 */
import React, { Component } from 'react';
import { Card, Tag } from 'antd';
import flvjs from 'flv.js';
import style from './style.sass';
const queryString = global.require('querystring');
const path = global.require('path');

class Index extends Component {
  constructor() {
    super(...arguments);

    const search = location.search.replace(/^\?{1}/, ''); // 获取信息

    console.log(search);

    this.item = queryString.parse(search);
  }

  componentDidMount() {
    const type = path.parse(this.item.streamPath).ext.replace(/^\.{1}/, '');

    // 初始化flv.js
    if (flvjs.isSupported()) {
      const videoElement = document.getElementById('video-element');
      const flvPlayer = flvjs.createPlayer({
        type,
        url: this.item.streamPath
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
    }
  }

  render() {
    const { title, nickname, liveType, streamPath } = this.item;
    const isZhibo = Number(liveType) === 1;

    return (
      <Card className={ style.card } cover={
        <div className={ style.videobox }>
          <video className={ style.video } id="video-element" controls={ true } />
        </div>
      }>
        <Card.Meta className={ style.meta }
          title={
            [
              <b key="title" className={ style.title }>{ title }</b>,
              <span key="nickname" className={ style.nickname }>{ nickname }</span>,
              <Tag key="liveType" color={ isZhibo ? '#f50' : '#2db7f5' }>{ isZhibo ? '直播' : '电台' }</Tag>
            ]
          }
          description={ streamPath }
        />
      </Card>
    );
  }
}

export default Index;