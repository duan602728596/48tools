import React from 'react';
import { bindActionCreators } from 'redux';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector, createStructuredSelector } from 'reselect';
import { Form, Input, InputNumber, Button, Radio, message } from 'antd';
import random from 'lodash-es/random';
import useActions from '../../../store/useActions';
import style from './add.sass';
import { setDownloadList } from '../reducer/reducer';
import { getVideoHtml, getPlayUrl, getAudioPlayUrl } from '../services';

const cheerio = global.require('cheerio');

const TYPE_OPTIONS = [
  {
    label: '视频',
    value: 'av'
  },
  {
    label: '音频',
    value: 'au'
  }
];

/* state */
const state = createStructuredSelector({
  // 下载列表
  mediaDownloadList: createSelector(
    ($$state) => $$state.has('mediaDownload') ? $$state.get('mediaDownload').get('mediaDownloadList').toJS() : undefined,
    ($$data) => $$data || []
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    setDownloadList
  }, dispatch)
});

/* 添加视频下载 */
function Add(props) {
  const { mediaDownloadList } = useSelector(state);
  const { action } = useActions(actions);
  const { getFieldDecorator, validateFields, resetFields } = props.form;
  const sessdata = localStorage.getItem('SESSDATA');

  // 获取initialState
  function formatInitialState($) {
    const scripts = $('script');
    let initialState = null;

    for (let i = 0, j = scripts.length; i < j; i++) {
      const { children } = scripts[i];

      // 获取 window.__INITIAL_STATE__ 信息
      if (children.length > 0 && /^window\._{2}INITIAL_STATE_{2}\s*=\s*.+$/.test(children[0].data)) {
        const str = children[0].data
          .replace(/window\._{2}INITIAL_STATE_{2}\s*=\s*/, '')
          .replace(/;\(function\(\){var s;.+$/i, '');

        initialState = JSON.parse(str);
        break;
      }
    }

    return initialState;
  }

  // 获取playInfo
  function formatPlayInfo($) {
    const scripts = $('script');
    let playInfo = null;

    for (let i = 0, j = scripts.length; i < j; i++) {
      const { children } = scripts[i];

      // 获取 window.__playinfo__ 信息
      if (children.length > 0 && /^window\._{2}playinfo_{2}=.+$/.test(children[0].data)) {
        playInfo = JSON.parse(children[0].data.replace(/window\.__playinfo__=/, ''));
        break;
      }
    }

    return playInfo;
  }

  // 获取视频链接
  function handleDownloadVideoSubmit(event) {
    event.preventDefault();

    validateFields(async (err, value) => {
      if (err) return;

      const pid = `${ random(10000, 99999) }`;

      try {
        if (value.type === 'au') {
          if (!/^[0-9]+$/.test(value.cid)) {
            message.error('必须输入数字！');

            return;
          }

          // 音频
          const res = await getAudioPlayUrl(value.cid);
          const audio = res.data.cdns[0];

          mediaDownloadList.push({ audio, pid, ...value });
        } else {
          // 视频
          const html = await getVideoHtml(value.cid, value.page);
          const $ = cheerio.load(html);

          // 获取cid
          const initialState = formatInitialState($);
          const playInfo = formatPlayInfo($);
          const cid = initialState?.videoData?.pages[value.page - 1].cid || null;

          if (playInfo === null || !playInfo.data.dash) {
            // 旧视频
            const playUrl = await getPlayUrl(
              /^[0-9]+$/.test(value.cid) ? value.cid : initialState.aid,
              cid,
              value.sessdata
            );

            if (playUrl.data.durl) {
              const video = playUrl.data.durl[0].url;

              mediaDownloadList.push({ video, initialState, playInfo, pid, ...value });
            } else {
              // m4s新视频，合并视频和音频
              const { dash } = playUrl.data;
              const video = dash.video[0].baseUrl;
              const audio = dash.audio[0].baseUrl;
              // 保存原始音频，音频可能会有错误
              const audio1 = dash.audio.map((item, index) => item.baseUrl);

              audio1.splice(0, 1);
              mediaDownloadList.push({ video, audio, audio1, initialState, playInfo, pid, ...value });
            }
          } else {
            // m4s新视频，合并视频和音频
            const { dash } = playInfo.data;
            const video = dash.video[0].baseUrl;
            const audio = dash.audio[0].baseUrl;
            // 保存原始音频，音频可能会有错误
            const audio1 = dash.audio.map((item, index) => item.baseUrl);

            audio1.splice(0, 1);
            mediaDownloadList.push({ video, audio, audio1, initialState, playInfo, pid, ...value });
          }
        }

        action.setDownloadList(mediaDownloadList);
        resetFields(['cid', 'page', 'type']);
      } catch (err) {
        console.error(err);
        message.error(`${ value.type === 'au' ? '音频' : '视频' }地址获取失败！`);
      }

      // 保存cookie
      if (value.sessdata) {
        localStorage.setItem('SESSDATA', value.sessdata);
      }
    });
  }

  return (
    <Form className={ style.form } onSubmit={ handleDownloadVideoSubmit }>
      <Form.Item label="BV/AV/AU">
        {
          getFieldDecorator('cid', {
            rules: [
              {
                required: true,
                message: '请输入BV/av/au号',
                whitespace: true
              }
            ]
          })(<Input />)
        }
        <i>BV号不包含"BV"字母。比如"BV1QJ411U74V"，只填入"1QJ411U74V"。</i>
      </Form.Item>
      <Form.Item label="Page">
        {
          getFieldDecorator('page', {
            initialValue: 1,
            rules: [
              {
                required: true,
                message: '请输入视频的页数'
              },
              {
                message: '值必须大于0',
                validator(rule, value, callback) {
                  if (value > 0) callback();
                  else callback(rule.message);
                }
              }
            ]
          })(<InputNumber className={ style.pageInput } />)
        }
      </Form.Item>
      <Form.Item label="类型">
        {
          getFieldDecorator('type', {
            initialValue: 'av'
          })(<Radio.Group options={ TYPE_OPTIONS } />)
        }
      </Form.Item>
      <Form.Item label="Cookie:SESSDATA">
        {
          getFieldDecorator('sessdata', {
            initialValue: sessdata
          })(<Input />)
        }
        <p>这个是cookie内的SESSDATA字段。部分高清视频需要该字段。请自行抓取该字段填入此处。</p>
      </Form.Item>
      <div className={ style.textRight }>
        <Link to="/">
          <Button className={ style.back } type="danger">返回</Button>
        </Link>
        <Button type="primary" htmlType="submit">添加</Button>
      </div>
    </Form>
  );
}

export default Form.create()(Add);