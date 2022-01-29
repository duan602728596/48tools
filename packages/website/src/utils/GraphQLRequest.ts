export interface GraphQLData<T> {
  data: T;
}

export interface GraphQLErrors {
  errors: Array<{
    message: string;
    locations: Array<{
      line: number;
      column: number;
    }>;
  }>;
}

export type GraphQLResponse<T> = GraphQLData<T> | GraphQLErrors;

const GraphQLUrl: string = process.env.NODE_ENV === 'development' ? '/proxy/api/graphql' : '/api/graphql';

/* 判断是否为GraphQLData */
export function isGraphQLData<T>(data: GraphQLResponse<T>): data is GraphQLData<T> {
  return 'data' in data;
}

/**
 * GraphQL请求
 * @param { string } query: 查询字符串
 */
async function GraphQLRequest<T = unknown>(query: string): Promise<GraphQLResponse<T>> {
  const res: Response = await fetch(GraphQLUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: null
    })
  });

  return res.json();
}

export default GraphQLRequest;