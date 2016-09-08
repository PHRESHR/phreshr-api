const gqlTools = require('graphql-tools');
import * as express from 'express';
import { Server }  from 'http';
import { apolloExpress, graphiqlExpress } from 'apollo-server';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';

import Schema from './schema';
import Resolvers from './resolvers';
import Mocks from './mocks';

dotenv.config({ silent: true });

const executableSchema = gqlTools.makeExecutableSchema({
  typeDefs: Schema,
  resolvers: {},
});

gqlTools.addMockFunctionsToSchema({
  schema: executableSchema,
  resolvers: {},
  mocks: Mocks,
});

class GraphQLServer {
  constructor(
    private app = express(),
    private ENV = process.env.NODE_ENV || 'development',
    private PORT: number = process.env.PORT || 8888) {
    this.setMiddleWare();
    this.setRoutes();
  }

  private setMiddleWare(): void {
    this.app.options('*', cors())
      .set('env', this.ENV)
      .set('port', this.PORT)
      .use(cors());
  }

  private setRoutes(): void {
    this.app.use('/graphql', bodyParser.json(), apolloExpress({
      schema: executableSchema,
      context: {},
    }))
    .use('/graphiql', graphiqlExpress({
      endpointURL: '/graphql',
    }));
  }

  startServer(): Server {
    return this.app.listen( this.PORT, () => console.log(
      `GraphQL Server is now running on http://localhost:${this.PORT}/graphql`
    ));
  }
}

export const server: Server = new GraphQLServer().startServer();
