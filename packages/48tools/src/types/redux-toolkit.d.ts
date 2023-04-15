export interface ApiUseQueryCore<T = unknown> {
  isLoading: boolean;
  isFetching: boolean;
  refetch: Function;
  data: T;
}