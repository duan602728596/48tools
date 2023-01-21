import { shell } from 'electron';
import { Fragment, type ReactElement, type MouseEvent } from 'react';
import { Button, Modal } from 'antd';
import type { UseModalReturnType } from '@48tools-types/antd';

/* 许可证 */
function License(props: {}): ReactElement {
  const [modalApi, modalContextHolder]: UseModalReturnType = Modal.useModal();

  // 打开许可证网站
  function handleOpenLicenseWebsiteClick(event: MouseEvent<HTMLAnchorElement>): void {
    shell.openExternal('https://www.gnu.org/licenses/');
  }

  // 点击查看许可证
  function handleLicenseDisplayClick(event: MouseEvent): void {
    modalApi.info({
      title: 'License',
      content: (
        <pre className="text-[12px]">
          { `48tools
Copyright (C) 2023 段昊辰

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see ` }
          <a role="button"
            aria-label="打开GNU许可证的网站"
            tabIndex={ 0 }
            onClick={ handleOpenLicenseWebsiteClick }
          >
            &lt;https://www.gnu.org/licenses/&gt;
          </a>.
        </pre>
      ),
      icon: null,
      width: 580,
      centered: true,
      okText: '关闭'
    });
  }

  return (
    <Fragment>
      <Button type="text" onClick={ handleLicenseDisplayClick }>License</Button>
      { modalContextHolder }
    </Fragment>
  );
}

export default License;