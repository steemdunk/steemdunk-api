import {
  PrimaryColumn,
  getConnection,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Entity,
  Column,
} from 'typeorm';
import { StringUtil } from '../../util';
import { User } from './user';
import { Context } from 'koa';

@Entity()
export class Session extends BaseEntity {

  @PrimaryColumn({ nullable: false })
  session!: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiry!: Date;

  @ManyToOne(type => User, { nullable: false, eager: true })
  @JoinColumn()
  user!: User;

  public static async generate(user: User): Promise<Session> {
    const sesStr = StringUtil.genSecureAlphaNumeric(48);

    const ses = new Session();
    ses.session = sesStr;
    ses.user = user;
    ses.expiry = new Date(Date.now() + (1000 * 60 * 60 * 24 * 3));
    return await ses.save();
  }

  public static async get(ctx: Context): Promise<User|undefined> {
    let session = Session.extractToken(ctx);
    if (!session) return;

    const repo = getConnection().getRepository(Session);
    const ses = await repo.findOne(session);
    if (ses) {
      if (ses.expiry.getTime() < Date.now() || ses.user.disabled) {
        await repo.remove(ses);
        return;
      }
    }

    return ses ? ses.user : undefined;
  }

  public static extractToken(ctx: Context): string|undefined {
    return ctx.headers.session;
  }

  public static async prune(): Promise<any> {
    await getConnection()
            .getRepository(Session)
            .createQueryBuilder()
            .delete()
            .where('expiry <= :date', { date: new Date() })
            .execute()
  }
}
