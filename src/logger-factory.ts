import * as log from 'loglevel';
import * as chalk from 'chalk';

const c = chalk.default;
const colorLogMethods = [
  c`{cyan trace}`,
  c`{blue debug}`,
  c`{green info}`,
  c`{yellow warn}`,
  c`{red error}`
];

const originalFactory = log.methodFactory;
(log as any).methodFactory = function(methodName, logLevel, loggerName) {
    var rawMethod = originalFactory(methodName, logLevel, loggerName);

    return function() {
      var messages = [
        c`{gray ${new Date().toISOString()}}`,
        c`[${loggerName}]`,
        c`${colorLogMethods[logLevel]}:`];
      for (var i = 0; i < arguments.length; i++) {
        if (i === 1) messages.push('\n');
        if (arguments[i] instanceof Error) {
          const err: Error = arguments[i];
          messages.push(c.red('Error: ' + err.message) + '\nStacktrace: ');
          if (err.stack) messages.push(err.stack);
        } else {
          messages.push(arguments[i]);
        }
      }
      rawMethod.apply(undefined, messages);
    };
};
log.setDefaultLevel('info');

export class LoggerFactory {
  public static create(name: string): log.Logger {
    return log.getLogger(name);
  }
}
