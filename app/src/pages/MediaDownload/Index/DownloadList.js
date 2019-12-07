import React, { Fragment, useState } from 'react';
import { bindActionCreators } from 'redux';
import { useSelector } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Table, Button, Popconfirm, Tag, message, Modal } from 'antd';
import moment from 'moment';
import without from 'lodash-es/without';
import useActions from '../../../store/useActions';
import style from './downloadList.sass';
import { setDownloadList, setDownloading, setLogs } from '../reducer/reducer';
import { downloadMedia } from '../services';
import option from '../../../components/option/option';
import store from '../../../store/store';

const url = global.require('url');
const path = global.require('path');
const childProcess = global.require('child_process');
const fse = global.require('fs-extra');

/* 从store内获取ffmpegProject */
function getLogsMap() {
  return store.getState().get('mediaDownload').get('logs').toJS();
}

/* state */
const state = createStructuredSelector({
  // 下载列表
  mediaDownloadList: createSelector(
    ($$state) => $$state.has('mediaDownload') ? $$state.get('mediaDownload').get('mediaDownloadList').toJS() : undefined,
    ($$data) => $$data || []
  ),
  // 正在下载
  downloading: createSelector(
    ($$state) => $$state.has('mediaDownload') ? $$state.get('mediaDownload').get('downloading').toJS() : undefined,
    ($$data) => $$data || []
  ),
  // 日志
  logs: createSelector(
    ($$state) => $$state.has('mediaDownload') ? $$state.get('mediaDownload').get('logs').toJS() : undefined,
    ($$data) => $$data || {}
  )
});

/* actions */
const actions = (dispatch) => ({
  action: bindActionCreators({
    setDownloadList,
    setDownloading,
    setLogs
  }, dispatch)
});

/* 下载列表 */
function DownloadList(props) {
  const { mediaDownloadList, downloading, logs } = useSelector(state);
  const { action } = useActions(actions);
  const [logsItem, setLogsItem] = useState(undefined); // 日志

  // 查看日志
  function handleLookLogs(record, event) {
    setLogsItem(record || undefined);
  }

  // 删除
  function handleDeleteClick(index, event) {
    mediaDownloadList.splice(index, 1);

    action.setDownloadList(mediaDownloadList);
  }

  // 监听stdout
  function handleChildProcessStdout(record, data) {
    const lm = getLogsMap();

    lm[record.pid].stdout += `${ data.toString() }\n`;
    action.setLogs(lm);
  }

  // 监听stderr
  function handleChildProcessStderr(record, data) {
    const lm = getLogsMap();

    lm[record.pid].stderr += `${ data.toString() }\n`;
    action.setLogs(lm);
  }

  // ffmpeg合并文件
  function ffmpegMergeVideo(videoFile, audioFile, title, record) {
    return new Promise((resolve, reject) => {
      const child = childProcess.spawn(option.ffmpeg, [
        '-i',
        videoFile,
        '-i',
        audioFile,
        path.join(option.output, `${ title }.mp4`)
      ]);

      child.stdout.on('data', handleChildProcessStdout.bind(this, record));
      child.stderr.on('data', handleChildProcessStderr.bind(this, record));
      child.on('close', () => resolve());
      child.on('error', (err) => reject(err) );
    }).catch((err) => {
      console.error(err);
    });
  }

  // 下载视频
  async function downloadVideo(record, time) {
    try {
      // 下载
      const title = `${ record.type }${ record.cid }_${ record.page }_${ time }`;
      const videoTitle = `${ title }.video.m4s`;
      const audioTitle = `${ title }.audio.m4s`;
      const [videoData, audioData] = await Promise.all([
        downloadMedia(record.video, record.cid),
        downloadMedia(record.audio, record.cid)
      ]);

      // 写入文件
      const videoFile = path.join(option.output, videoTitle);
      const audioFile = path.join(option.output, audioTitle);

      await Promise.all([
        fse.outputFile(videoFile, videoData),
        fse.outputFile(audioFile, audioData)
      ]);

      // 合并成一个文件
      await ffmpegMergeVideo(videoFile, audioFile, title, record);

      // 删除临时文件
      await Promise.all([
        fse.remove(videoFile),
        fse.remove(audioFile)
      ]);

      message.success(`${ record.type }${ record.cid }-${ record.page }：下载成功！`);
    } catch (err) {
      console.error(err);
      message.error(`${ record.type }${ record.cid }-${ record.page }：下载失败！`);
    }

    action.setDownloading(without(downloading, record.pid));
  }

  // 下载旧视频
  async function downloadMediaFile(record, time, type = 'video') {
    try {
      const parseVideoResult = url.parse(record[type]);
      const parsePathResult = path.parse(parseVideoResult.pathname); // ext

      // 下载
      const title = `${ record.type }${ record.cid }_${ record.page }_${ time }${ parsePathResult.ext }`;
      const data = await downloadMedia(record[type], record.cid, type);

      await fse.outputFile(path.join(option.output, title), data);
      message.success(`${ record.type }${ record.cid }-${ record.page }：下载成功！`);
    } catch (err) {
      console.error(err);
      message.error(`${ record.type }${ record.cid }-${ record.page }：下载失败！`);
    }

    action.setDownloading(without(downloading, record.pid));
  }

  // 下载
  function handleDownloadClick(record, event) {
    const time = moment().format('YYYY.MM.DD.HH.mm.ss');

    logs[record.pid] = {
      stderr: ''
    };
    downloading.push(record.pid);
    action.setDownloading(downloading);
    message.info(`${ record.type }${ record.cid }-${ record.page }：开始下载。`);

    if (record.type === 'au') {
      logs[record.pid].stdout = '正在下载音频。类型：1。';
      downloadMediaFile(record, time, 'audio');
    } else {
      if (record.audio) {
        logs[record.pid].stdout = '正在下载视频。类型：2。';
        downloadVideo(record, time);
      } else {
        logs[record.pid].stdout = '正在下载视频。类型：1。';
        downloadMediaFile(record, time, 'video');
      }
    }

    action.setLogs(logs);
  }

  const columns = [
    {
      title: 'av/au Id',
      dataIndex: 'cid'
    },
    {
      title: 'page',
      dataIndex: 'page'
    },
    {
      title: '类型',
      dataIndex: 'type',
      render(value, record, index) {
        return value === 'au' ? <Tag color="purple">音频</Tag> : <Tag color="magenta">视频</Tag>;
      }
    },
    {
      title: '操作',
      key: 'handle',
      width: 315,
      render(value, record, index) {
        const inDownloading = downloading.includes(record.pid);

        return (
          <Button.Group>
            <Button type="primary"
              icon="download"
              loading={ inDownloading }
              onClick={ (event) => handleDownloadClick(record, event) }
            >
              下载
            </Button>
            <Button icon="snippets" disabled={ !inDownloading } onClick={ (event) => handleLookLogs(record, event) }>查看日志</Button>
            <Popconfirm title="确认要删除吗？" onConfirm={ (event) => handleDeleteClick(index, event) }>
              <Button type="danger" icon="delete" loading={ inDownloading }>删除</Button>
            </Popconfirm>
          </Button.Group>
        );
      }
    }
  ];

  return (
    <Fragment>
      <Table dataSource={ mediaDownloadList }
        columns={ columns }
        bordered={ true }
        rowKey={ (record) => record.pid }
        pagination={{
          defaultPageSize: 20,
          showQuickJumper: true,
          showSizeChanger: true
        }}
      />
      {/* 日志弹出层 */}
      <Modal visible={ !!logsItem }
        title={
          logsItem
            ? `${ logsItem.cid } - ${ logsItem.page }`
            : ''
        }
        closable={ true }
        destroyOnClose={ true }
        centered={ true }
        width={ 830 }
        footer={ <Button onClick={ (event) => handleLookLogs(undefined, event) }>关闭</Button> }
        onCancel={ () => handleLookLogs(undefined) }
      >
        <pre className={ style.logs }>
          <div className={ style.logsSpace }>{ (logsItem && logs[logsItem.pid]) ? logs[logsItem.pid].stdout : null }</div>
          <div>{ (logsItem && logs[logsItem.pid]) ? logs[logsItem.pid].stderr : null }</div>
        </pre>
      </Modal>
    </Fragment>
  );
}

export default DownloadList;