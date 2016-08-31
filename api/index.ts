const gqlTools = require('graphql-tools')
import * as express from 'express';
import { Server }  from 'http';
import { apolloExpress, graphiqlExpress } from 'apollo-server';
import { urlencoded, json } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compress from 'compression';
import * as cors from 'cors';
import * as methodOverride from 'method-override';
import * as logger from 'morgan';
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
    private PORT: number = process.env.PORT || 8080,
    private GRAPHQL_PORT: number = process.env.GRAPHQL_PORT || 8888) {
    this.setMiddleWare();
    this.setRoutes();
  }

  private setMiddleWare(): void {
    this.app.use(compress())
      .set('env', this.ENV)
      .set('port', this.PORT)
      .set('graphQLPort', this.GRAPHQL_PORT)
      .options('*', cors())
      .use(cors())
      .use(urlencoded( { extended: true }))
      .use(json())
      .use(cookieParser())
      .use(methodOverride())
      .use(logger('dev'));
  }

  private setRoutes(): void {
    this.app.use('/graphql', json(), apolloExpress({
      schema: executableSchema,
      context: {},
    }))
    .use('/graphiql', graphiqlExpress({
      endpointURL: '/graphql',
    }));
  }

  startServer(): Server {
    return this.app.listen( this.GRAPHQL_PORT, () => {
      console.log( `GraphQL server listening on port ${this.GRAPHQL_PORT}` );
    });
  }
}

export const server: Server = new GraphQLServer().startServer();
