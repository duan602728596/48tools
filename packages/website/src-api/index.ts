import process from 'process';
import type { IncomingMessage, ServerResponse } from 'http';
import express, { type Express } from 'express';
import { graphqlHTTP, type OptionsData, type GraphQLParams } from 'express-graphql';
import { buildSchema } from 'graphql';
import querySchema from './schema/query.js';
import rootValue from './rootValue/rootValue.js';

const app: Express = express();

type Request = IncomingMessage & { url: string };
type Response = ServerResponse & { json?: (data: unknown) => void };

/* graphql服务 */
app.use('/api/graphql',
  graphqlHTTP(async function(req: Request, res: Response, params?: GraphQLParams): Promise<OptionsData> {
    return {
      schema: buildSchema(querySchema),
      rootValue: await rootValue(),
      graphiql: process.env.VERCEL_ENVIRONMENT !== '1'
    };
  })
);

export default app;