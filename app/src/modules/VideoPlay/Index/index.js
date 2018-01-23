import React, { Component } from 'react';
import { Card } from 'antd';
import style from './style.sass';
const querystring = global.require('querystring');
const path = global.require('path');

class VideoPlay extends Component{
  item: {
    title: string,
    subTitle: string,
    streamPath: string
  };

  constructor(): void{
    super(...arguments);

    const search: string = location.search.replace(/^\?{1}/, ''); // 获取信息

    this.item = querystring.parse(search);
  }
  componentDidMount(): void{
    const type: string = path.parse(this.item.streamPath).ext.replace(/^\.{1}/, '');
    // 初始化flv.js
    if(flvjs.isSupported()){
      const videoElement: Element = document.getElementById('video-element');
      const flvPlayer: flvjs = flvjs.createPlayer({
        type: type,
        url: this.item.streamPath
      });
      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
    }
  }
  render(): Object{
    return (
      <Card className={ style.card } cover={
        <div className={ style.videobox }>
          <video className={ style.video } id="video-element" controls={ true } />
        </div>
      }>
        <Card.Meta className={ style.meta } title={
          <span>{ this.item.title }</span>
        } description={
          <span className={ style.subTitle }>{ this.item.subTitle }</span>
        } />
      </Card>
    );
  }
}

export default VideoPlay;