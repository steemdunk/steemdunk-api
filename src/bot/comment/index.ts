import {
  CommentOp,
  Client
} from 'steeme';
import { UserProcessor } from './user';
import { BotUpvoteSupport } from './support';

export class Comment {

  private readonly userProcessor: UserProcessor;
  private readonly botSupport: BotUpvoteSupport;

  constructor(client: Client) {
    this.userProcessor = new UserProcessor(client);
    this.botSupport = new BotUpvoteSupport(client);
  }

  async start(): Promise<void> {
    await this.userProcessor.startQueue();
    await this.botSupport.start();
  }

  async handleOp(comment: CommentOp[1]) {
    this.userProcessor.handleOp(comment);
  }
}
