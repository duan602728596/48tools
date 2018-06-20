import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector, createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { Affix, Button, Input, Table, message, Popconfirm } from 'antd';
import publicStyle from '../../publicMethod/public.sass';
import style from './style.sass';

class AvDownload extends Component{
  render(): Object{
    return (
      <Fragment>
        {/* 功能区 */}
        <Affix className={ publicStyle.affix }>
          <div className={ `${ publicStyle.toolsBox } clearfix` }>
            <div className={ publicStyle.fl }>
              <label htmlFor="av-number">av号: </label>
              <Input className={ style.input } id="av-number" />
              <label className={ publicStyle.ml10 } htmlFor="av-page">视频page: </label>
              <Input className={ style.page } id="av-page" />
            </div>
            <div className={ publicStyle.fr }>
              <Link to="/">
                <Button type="danger" icon="poweroff">返回</Button>
              </Link>
            </div>
          </div>
        </Affix>
      </Fragment>
    );
  }
}

export default AvDownload;