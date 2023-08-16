import { shell } from 'electron';
import { useMemo, type ReactElement, type MouseEvent } from 'react';
import { Typography, type TypographyProps } from 'antd';
import * as softwareList from './softwareList.json' assert { type: 'json' };

const softwareListJson: any = softwareList;
const { Paragraph, Text }: TypographyProps = Typography;

// 打开许可证网站
function handleOpenWebsiteClick(event: MouseEvent<HTMLAnchorElement>): void {
  shell.openExternal(event.target['getAttribute']('data-href')!);
}

/* 软件列表 */
function Software(props: {}): ReactElement {
  const list: Array<ReactElement> = useMemo(function(): Array<ReactElement> {
    return softwareListJson.software.map((s: { name: string; href: string }): ReactElement => {
      return (
        <li key={ s.name }>
          <a role="button"
            aria-label={ `打开网站：${ s.name }` }
            tabIndex={ 0 }
            data-href={ s.href }
            onClick={ handleOpenWebsiteClick }
          >
            { s.name }
          </a>
        </li>
      );
    });
  }, [softwareListJson.software]);

  return (
    <Paragraph>
      <Text strong={ true }>本软件基于以下开源项目开发：</Text>
      <ul className="grid grid-cols-4">{ list }</ul>
      <Text>以及其他开源项目。</Text>
    </Paragraph>
  );
}

export default Software;