import * as request from 'superagent';
import { Config } from './config';

const BASE_API = process.env.NODE_ENV !== 'TEST'
                  ? `${Config.steem_connect.host}/api` : '';

export class SC2Error extends Error {

  readonly response: request.Response;

  constructor(res: request.Response, msg?: string) {
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
  static async send(endpoint: string, token?: string) {
    const req = request.post(BASE_API + endpoint);
    if (token) req.set('Authorization', token);

    const res = await req;
    if (res.status !== 200) {
      throw new SC2Error(res);
    }
    return res.body;
  }

  static async getToken(code: string): Promise<AuthResponse|undefined> {
    const secret = Config.steem_connect.client_secret;
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
