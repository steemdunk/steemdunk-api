import {
  CurationQuota,
  PlanPrice,
  Payment,
  Plan
} from './payment';
import * as crypto from 'crypto';

export class StringUtil {

  static readonly ALPHA_NUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  public static genSecure(size: number = 64): Buffer {
    return crypto.randomBytes(size);
  }

  public static genSecureAscii(size: number = 16): string {
    const secure = StringUtil.genSecure(size);
    let ascii = '';
    for (const byte of secure) {
      // Range from ASCII 33 to 126
      ascii += String.fromCharCode(33 + (byte % 94));
    }
    return ascii;
  }

  public static genSecureAlphaNumeric(size: number = 16): string {
    const secure = StringUtil.genSecure(size);
    const charLen = StringUtil.ALPHA_NUMERIC.length;
    let ascii = '';
    for (const byte of secure) {
      // Range from ASCII
      ascii += StringUtil.ALPHA_NUMERIC[byte % charLen];
    }
    return ascii;
  }
}
