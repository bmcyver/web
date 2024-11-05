import chalk from 'chalk';

export const logger = {
  log: (...message: any) => console.log(`${chalk.gray('[*] LOG')}`, ...message),
  flag: (flag: any) => console.info(`${chalk.cyan('[+] FLAG')} ${flag}`),
  info: (...message: any) =>
    console.info(`${chalk.blueBright('[*] INFO')}`, ...message),
  success: (...message: any) =>
    console.info(`${chalk.greenBright('[+] SUCCESS')}`, ...message),
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
