import dynamicComponent, { type LoaderReturn } from '../../../router/dynamicComponent';

export default dynamicComponent((): LoaderReturn => import('./Credits'));