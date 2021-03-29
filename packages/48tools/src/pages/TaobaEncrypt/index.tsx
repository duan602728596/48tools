import {
  Fragment,
  useState,
  useEffect,
  useRef,
  ReactElement,
  RefObject,
  Dispatch as D,
  SetStateAction as S,
  MouseEvent
} from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Form, BackTop, message, Empty } from 'antd';
import type { FormInstance } from 'antd/es/form';
import hljs from 'highlight.js/lib/core';
import jsonLanguages from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/atom-one-light.css';
import style from './index.sass';
import { encrypt, decrypt } from './encrypt';

hljs.registerLanguage('json', jsonLanguages);

interface EncryptResult {
  type: 'encrypt' | 'decrypt';
  result: string;
  json: boolean;
}

/* 桃叭加密解密 */
function TaobaEncrypt(props: {}): ReactElement {
  const codeRef: RefObject<HTMLElement> = useRef(null);

  // 解密或者解密结果
  const [result, setResult]: [EncryptResult | undefined, D<S<EncryptResult | undefined>>] = useState(undefined);
  const [form]: [FormInstance] = Form.useForm();

  // 加密
  async function handleEncryptClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const query: string | undefined = form.getFieldValue('q');

    if (!query) return;

    try {
      setResult({
        type: 'encrypt',
        result: await encrypt(query),
        json: false
      });
    } catch (err) {
      console.error(err);
      message.error('加密失败！');
    }
  }

  // 解密
  async function handleDecryptClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const query: string | undefined = form.getFieldValue('q');

    if (!query) return;

    try {
      setResult({
        type: 'decrypt',
        result: await decrypt(query),
        json: false
      });
    } catch (err) {
      message.error('解密失败！');
    }
  }

  // 解密并转换成json
  async function handleDecryptToJsonClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    const query: string | undefined = form.getFieldValue('q');

    if (!query) return;

    try {
      const data: string = await decrypt(query);
      let formatData: string = data;
      let json: boolean = true;

      try {
        formatData = JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        json = false;
      }

      setResult({
        type: 'decrypt',
        result: formatData,
        json
      });
    } catch (err) {
      message.error('解密失败！');
    }
  }

  useEffect(function(): void {
    if (result && codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [result, codeRef.current]);

  return (
    <Fragment>
      <div key="main" className={ style.main }>
        <div className={ style.leftContent }>
          <div className={ style.marginBottom }>
            <Link className={ style.marginRight } to="/">
              <Button type="primary" danger={ true }>返回</Button>
            </Link>
            <Button.Group>
              <Button onClick={ handleEncryptClick }>加密</Button>
              <Button onClick={ handleDecryptClick }>解密</Button>
              <Button onClick={ handleDecryptToJsonClick }>解密并格式化</Button>
            </Button.Group>
          </div>
          <Form form={ form }>
            <Form.Item name="q" noStyle={ true }>
              <Input.TextArea rows={ 25 } spellCheck={ false } />
            </Form.Item>
          </Form>
        </div>
        <div className={ style.rightContent }>
          <pre className={ style.codePre }>
            <code ref={ codeRef } className={ result?.['json'] ? 'json' : undefined }>
              { result?.['result'] ?? <Empty description="请输入加密或机密的字符串" /> }
            </code>
          </pre>
        </div>
      </div>
      <BackTop key="backTop" />
    </Fragment>
  );
}

export default TaobaEncrypt;