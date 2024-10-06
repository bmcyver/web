import chalk from 'chalk';

export const logger = {
  flag: (flag: string) =>
    console.info(`${chalk.cyan('[+] FLAG:')} ${chalk.cyanBright(flag)}`),
  info: (message: string) =>
    console.info(`${chalk.blue('[*]')} ${chalk.blueBright(message)}`),
  success: (message: string) =>
    console.info(`${chalk.greenBright('[+]')} ${chalk.greenBright(message)}`),
  error: (message: string) =>
    console.error(`${chalk.red('[-]')} ${chalk.redBright(message)}`),
};
