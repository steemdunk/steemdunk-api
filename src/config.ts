import { getEnvVar } from './util';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

export interface NetOptions {
  address_prefix: string;
  chain_id: string;
  node: string;
}

export interface SteemConnect {
  host: string;
  redirect_uri: string;
  client_secret: string;
}

export interface SteemSettings {
  broadcast_account: string;
  posting_wif: string;
  active_wif: string;
  voting_power: number;
}

export interface Config {
  steem_net: NetOptions;
  steem_settings: SteemSettings;
  steem_connect: SteemConnect;
}

let config: Config|undefined;
export function getConfig(): Config {
  if (config === undefined) {
    const file = getEnvVar('SD_CONFIG') || 'config.yml';
    const data = fs.readFileSync(file).toString('utf8');
    const raw = yaml.safeLoad(data);

    config = {
      steem_net: raw.steem_net,
      steem_settings: raw.steem_settings,
      steem_connect: raw.steem_connect
    };
  }
  return config;
}
