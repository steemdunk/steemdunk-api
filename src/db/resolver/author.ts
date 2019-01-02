import { Resolver, Query, Arg } from 'type-graphql';
import { Author } from '../entity/author';

@Resolver(of => Author)
export class AuthorResolver {

  @Query(returns => [Author])
  static patrons(@Arg('author') author: string): Promise<Author[]> {
    return Author.find({
      where: {
        author
      },
      relations: [ 'user' ]
    });
  }
}
