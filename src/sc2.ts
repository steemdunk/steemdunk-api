import * as request from 'superagent';
import { getConfig } from './config';

export class SC2Error extends Error {

  readonly response: request.Response;

  constructor(res: request.Response) {
    super('SC2 send error: ' + res.status);
    this.response = res;
  }

}

export interface AuthResponse {
  username: string;
  access_token: string;
  expires_in: number;
}

export class SC2 {
  private static _BASE_API: string|undefined;
  static get BASE_API(): string {
    if (SC2._BASE_API === undefined) {
      SC2._BASE_API = `${getConfig().steem_connect.host}/api`;
    }
    return SC2._BASE_API;
  }

  static async send(endpoint: string, token?: string) {
    const req = request.post(SC2.BASE_API + endpoint);
    if (token) req.set('Authorization', token);

    const res = await req;
    if (res.status !== 200) {
      throw new SC2Error(res);
    }
    return res.body;
  }

  static async getToken(code: string): Promise<AuthResponse|undefined> {
    const secret = getConfig().steem_connect.client_secret;
    const auth = `/oauth2/token?code=${code}&client_secret=${secret}`;
    const data = await SC2.send(auth);
    if (!(data.username && data.access_token && data.expires_in)) {
      return undefined;
    }
    return data;
  }

  static async getProfile(token: string): Promise<any> {
    return await SC2.send('/me', token);
  }
}
