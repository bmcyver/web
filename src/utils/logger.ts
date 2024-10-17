import chalk from 'chalk';

export const logger = {
  flag: (flag: any) => console.info(`${chalk.cyan('[+] FLAG')} ${flag}`),
  info: (...message: any) =>
    console.info(`${chalk.blue('[*] INFO')} ${message.join(' ')}`),
  success: (...message: any) =>
    console.info(`${chalk.greenBright('[+] SUCCESS')} ${message.join(' ')}`),
  error: (message: any) =>
    console.error(
      `${chalk.red('[-] ERROR')} ${chalk.redBright(message.toString())}`,
    ),
  fatal: (message: any) => {
    console.error(
      `${chalk.red('[-] FATAL')} ${chalk.redBright(message.toString())}`,
    );
    process.exit(1);
  },
};
