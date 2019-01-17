import { AuthorModel, Author, DbErrorCode } from '../../db';
import { ProcessApiOpts, RpcOutgoing } from './util';
import { Payment } from 'steemdunk-common';

export async function getAuthors(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const data = await opts.user.getSupportedAuthors();
  const supporting: AuthorModel[] = data.map(d => ({
    author: d.author,
    voteWeight: d.vote_weight,
    voteDelay: d.vote_delay,
    maxDailyVotes: d.max_daily_votes
  }));
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

  author.max_daily_votes = model.maxDailyVotes;
  author.vote_delay = model.voteDelay;
  author.vote_weight = model.voteWeight;
  await author.save();

  return {};
}

export async function addAuthor(opts: ProcessApiOpts): Promise<RpcOutgoing> {
  const model = sanitizeAuthorSettings(opts.params);
  if (!model) return { error: 'Invalid settings provided.' };

  {
    let quota = Payment.getQuota(opts.user.premium.plan);
    if (opts.user.admin === true) quota = Number.MAX_SAFE_INTEGER;

    const count = await Author.getCount(opts.user);
    if (count >= quota) return { error: 'Quota limit exceeded.' };
  }

  try {
    const acc = await opts.client.db.getAccounts(model.author);
    if (acc.length !== 1) {
      return { error: 'Account not found on Steemit.' };
    }
  } catch (e) {
    return {
      error: 'Failed to connect to Steemit.'
    };
  }

  const author = new Author();
  author.user = opts.user;
  author.author = model.author;
  author.max_daily_votes = model.maxDailyVotes;
  author.vote_delay = model.voteDelay;
  author.vote_weight = model.voteWeight;

  try {
    await author.save();
    return {
      data: model
    };
  } catch (e) {
    if (e.code === DbErrorCode.UQ_VIOLATION) {
      return { error: 'You already support this author!' };
    }
    throw e;
  }
}

function sanitizeAuthorSettings(params: AuthorModel): AuthorModel|null {
  let author: string = params.author;
  const voteWeight: number = Number(params.voteWeight);
  const voteDelay: number = Number(params.voteDelay);
  const maxDailyVotes: number = Number(params.maxDailyVotes);

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
  } else if (!Number.isSafeInteger(maxDailyVotes)
              || maxDailyVotes < 0
              || maxDailyVotes > 20) {
    return null;
  }

  author = author.toLowerCase();
  if (author.charAt(0) === '@') {
    author = author.slice(1);
  }

  return {
    author,
    voteWeight,
    voteDelay,
    maxDailyVotes
  };
}
