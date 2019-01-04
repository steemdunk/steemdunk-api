import { ApolloError } from 'apollo-server-koa';

export class ResourceNotFoundError extends ApolloError {
  constructor(msg: string) {
    super(msg, 'RESOURCE_NOT_FOUND');
  }
}
