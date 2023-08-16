import type { ReactElement, PropsWithChildren } from 'react';
import { Typography, type TypographyProps } from 'antd';
import { MDXProvider as Provider } from '@mdx-js/react';
import type { Props } from '@mdx-js/react/lib';

const { Title, Text, Paragraph }: TypographyProps = Typography;

const MDXComponents: Props['components'] = {
  h1: (props: PropsWithChildren): ReactElement => <Title level={ 1 }>{ props.children }</Title>,
  h2: (props: PropsWithChildren): ReactElement => <Title level={ 2 }>{ props.children }</Title>,
  strong: (props: PropsWithChildren): ReactElement => <Text strong={ true }>{ props.children }</Text>,
  p: (props: PropsWithChildren): ReactElement => <Paragraph>{ props.children }</Paragraph>
};

/* mdx配置 */
function MDXProvider(props: Required<PropsWithChildren>): ReactElement {
  return (
    <Provider components={ MDXComponents }>{ props.children }</Provider>
  );
}

export default MDXProvider;