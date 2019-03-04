/**
 * 新窗口播放视频
 */
import * as React from 'react';
import { Component } from 'react';
import { Card } from 'antd';
import flvjs from 'flv.js';
import style from './style.sass';
const queryString = global.require('querystring');
const path = global.require('path');

class Index extends Component {
  constructor() {
    super(...arguments);

    const search = location.search.replace(/^\?{1}/, ''); // 获取信息

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
    return (
      <Card className={ style.card } cover={
        <div className={ style.videobox }>
          <video className={ style.video } id="video-element" controls={ true } />
        </div>
      }>
        <Card.Meta className={ style.meta }
          title={
            <span>{ this.item.title }</span>
          }
          description={
            <span className={ style.subTitle }>{ this.item.subTitle }</span>
          }
        />
      </Card>
    );
  }
}

export default Index;