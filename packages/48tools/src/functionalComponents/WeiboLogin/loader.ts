import dynamicComponent from '../../router/dynamicComponent';

export default dynamicComponent(() => import('./WeiboLogin'), false);