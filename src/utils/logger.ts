import chalk from 'chalk';

export const logger = {
  flag: (flag: any) =>
    console.info(
      `${chalk.cyan('[+] FLAG:')} ${chalk.cyanBright(flag.toString())}`,
    ),
  info: (message: any) =>
    console.info(
      `${chalk.blue('[*]')} ${chalk.blueBright(message.toString())}`,
    ),
  success: (message: any) =>
    console.info(
      `${chalk.greenBright('[+]')} ${chalk.greenBright(message.toString())}`,
    ),
  error: (message: any) =>
    console.error(`${chalk.red('[-]')} ${chalk.redBright(message.toString())}`),
};
