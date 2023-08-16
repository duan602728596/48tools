import { shell } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { Typography, type TypographyProps } from 'antd';

const { Paragraph }: TypographyProps = Typography;

// 打开许可证网站
function handleOpenLicenseWebsiteClick(event: MouseEvent<HTMLAnchorElement>): void {
  shell.openExternal('https://www.gnu.org/licenses/');
}

/* 许可证 */
function License(props: {}): ReactElement {
  return (
    <Paragraph>
      <pre className="text-[12px]">
        { `48tools
Copyright (C) 2023 Haochen Duan

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
    </Paragraph>
  );
}

export default License;