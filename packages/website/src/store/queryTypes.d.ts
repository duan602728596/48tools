import type { Api, BaseQueryFn, EndpointDefinitions } from '@reduxjs/toolkit/query/react';
import type { EndpointBuilder, QueryDefinition } from '@reduxjs/toolkit/src/query/endpointDefinitions';

// @redux/toolkit/query 返回的结果
export interface QuerySubState<T> {
  currentData: T;
  data: T;
  endpointName: string;
  fulfilledTimeStamp: number;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isUninitialized: boolean;
  refetch: Function;
  requestId: string;
  startedTimeStamp: number;
  status: string;
}

export type QueryApi = Api<BaseQueryFn, EndpointDefinitions, string, string>;
export type QueryEndpointsBuilder = EndpointBuilder<BaseQueryFn, string, string>;
export type QueryEndpointsFuncReturn = Record<string, QueryDefinition<unknown, BaseQueryFn, string, unknown>>;