import type { Api } from '@reduxjs/toolkit/query/react';
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

export type QueryApi = Api<any, any, string, string>;
export type QueryEndpointBuilder = EndpointBuilder<any, string, string>;
export type EndpointsReturn = Record<string, QueryDefinition<any, any, any, any>>;