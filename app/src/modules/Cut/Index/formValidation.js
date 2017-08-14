// @flow
/**
 * 表单验证模块
 * @param { Object } data: 数据
 * @param { Object } rule: 规则 key,数据的key; value.text,验证不成功的提示信息
 * @return { Boolean }
 */
import { message } from 'antd';

function formValidation(data: Object, rule: Object): boolean{
  let res: boolean = true;
  for(const key: string in rule){
    if(!(data[key] && !/^\s*$/.test(data[key]))){
      res = false;
      message.error(rule[key].text);
      break;
    }
  }
  return res;
}

export default formValidation;