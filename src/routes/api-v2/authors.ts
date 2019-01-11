import {
  Payment,
  Plan
} from 'steemdunk-common';
import { AuthorModel, Author, DbErrorCode } from '../../db';
import { ProcessApiOpts, RpcOutgoing } from './util';

export async function getAuthors(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const data = await opts.user.getSupportedAuthors();
  const supporting: AuthorModel[] = [];
  for (const d of data) {
    supporting.push({
      author: d.author,
      vote_weight: d.vote_weight,
      vote_delay: d.vote_delay,
      max_daily_votes: d.max_daily_votes
    });
  }

  return {
    data: supporting
  };
}

export async function rmAuthor(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  if (!opts.params.author) {
    return {
      error: 'Author not provided.'
    }
  }

  const author = await Author.findOne({
    where: {
      user: opts.user,
      author: opts.params.author
    }
  });
  if (author) await author.remove();
  return {};
}

export async function updateAuthor(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const model = sanitizeAuthorSettings(opts.params);
  if (!model) {
    return {
      error: 'Failed to update author, invalid settings provided.'
    };
  }

  const author = await Author.findOne({
    where: {
      user: opts.user,
      author: model.author
    }
  });
  if (!author) {
    return {
      error: 'Failed to find author'
    };
  }

  author.max_daily_votes = model.max_daily_votes;
  author.vote_delay = model.vote_delay;
  author.vote_weight = model.vote_weight;
  await author.save();

  return {};
}

export async function addAuthor(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const model = sanitizeAuthorSettings(opts.params);
  if (!model) {
    return {
      error: 'Failed to add author, invalid settings provided.'
    };
  }

  const count = await Author.getCount(opts.user);
  let quota = opts.user.premium ? Payment.getQuota(opts.user.premium.plan) : 0;
  if (opts.user.admin === true) quota = Number.MAX_SAFE_INTEGER;
  if (count >= quota) {
    let msg = 'Quota limit exceeded.';
    if (opts.user.premium && opts.user.premium.plan !== Plan.GOLD) {
      msg += ' Upgrading your plan will allow you to add more authors.';
    }
    return {
      error: msg
    };
  }

  try {
    const acc = await opts.client.db.getAccounts(model.author);
    if (acc.length !== 1) {
      return {
        error: 'Account not found on Steemit.'
      };
    }
  } catch (e) {
    return {
      error: 'Failed to connect to Steemit, please try again later.'
    };
  }

  const author = new Author();
  author.user = opts.user;
  author.author = model.author;
  author.max_daily_votes = model.max_daily_votes;
  author.vote_delay = model.vote_delay;
  author.vote_weight = model.vote_weight;

  try {
    await author.save();
    return {
      data: model
    };
  } catch (e) {
    if (e.code === DbErrorCode.UQ_VIOLATION) {
      return {
        error: 'You already support this author!'
      };
    }
    throw e;
  }
}

function sanitizeAuthorSettings(params: any): AuthorModel|null {
  let author: string = params.author;
  const voteWeight: number = parseInt(params.vote_weight, 10);
  const voteDelay: number = parseInt(params.vote_delay, 10);
  const maxVotes: number = parseInt(params.max_daily_votes, 10);

  if (!(author && author.length)) {
    return null;
  } else if (!Number.isSafeInteger(voteWeight)
              || voteWeight < 1
              || voteWeight > 100) {
    return null;
  } else if (!Number.isSafeInteger(voteDelay)
              || voteDelay < 0
              || voteDelay > 1440) {
    return null;
  } else if (!Number.isSafeInteger(maxVotes)
              || maxVotes < 0
              || maxVotes > 20) {
    return null;
  }

  author = author.toLowerCase();
  if (author.charAt(0) === '@') {
    author = author.slice(1);
  }

  return {
    author,
    vote_weight: voteWeight,
    vote_delay: voteDelay,
    max_daily_votes: maxVotes
  };
}
