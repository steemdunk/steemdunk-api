import {
  PrimaryColumn,
  getConnection,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Entity,
  Column,
} from 'typeorm';
import { User } from './user';

@Entity()
export class Session extends BaseEntity {

  @PrimaryColumn({ nullable: false })
  session!: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiry!: Date;

  @ManyToOne(type => User, { nullable: false, eager: true })
  @JoinColumn()
  user!: User;

  static async get(sessionId: string): Promise<User|undefined> {
    if (!sessionId) return;
    const repo = getConnection().getRepository(Session);
    const ses = await repo.findOne(sessionId);
    if (ses && ses.expiry.getTime() < Date.now()) {
      await repo.remove(ses);
      return;
    }

    return ses ? ses.user : undefined;
  }

  static async prune(): Promise<any> {
    await getConnection()
            .getRepository(Session)
            .createQueryBuilder()
            .delete()
            .where('expiry <= :date', { date: new Date() })
            .execute()
  }
}
