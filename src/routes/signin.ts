import {
  Plan,
  SC2,
  LoggerFactory
} from 'steemdunk-common';
import { User, Premium, BotSupport, Session } from '../db';
import { protect, loadUser } from './middleware';
import { SetupRoute } from './util';
import HttpStatus from 'http-status';

const LOGGER = LoggerFactory.create('route_signin');

export class RouteSignin {
  public static setup(opts: SetupRoute) {
    opts.router.post('/signin', loadUser, async ctx => {
      if (ctx.state.user) {
        ctx.status = HttpStatus.BAD_REQUEST;
        return;
      }

      const code = ctx.request.body.code;
      if (!code) {
        ctx.status = HttpStatus.UNAUTHORIZED;
        return;
      }

      try {
        const tokenData = await SC2.getToken(code);
        if (!tokenData) {
          ctx.status = HttpStatus.UNAUTHORIZED;
          return;
        }

        const username = tokenData.username;
        let user = await User.findOne({
          where: {
            username
          }
        });
        if (!user) {
          const premium = new Premium();
          premium.plan = Plan.BRONZE;
          premium.expiry = new Date(Date.now() + (1000 * 60 * 60 * 24 * 3650));
          await premium.save();

          const sup = new BotSupport();
          await sup.save();

          user = new User();
          user.username = username;
          user.premium = premium;
          user.bot_support = sup;
          await user.save();

          sup.user = user;
          await sup.save();
        } else if (user.disabled) {
          user.disabled = false;
          await user.save();
        }

        const ses = await Session.generate(user);
        ctx.status = 200;
        ctx.body = {
          token: ses.session,
          expiry: ses.expiry.getTime()
        };
      } catch (e) {
        ctx.status = HttpStatus.UNAUTHORIZED;
        if (e.status === 401) {
          return;
        }
        LOGGER.error('SC2 auth error', e);
      }
    });

    opts.router.post('/signout', protect, async ctx => {
      if (ctx.state.user) {
        const session = ctx.header.session;
        if (session) await Session.delete(session);
      }
      ctx.status = HttpStatus.OK;
    });
  }
}
