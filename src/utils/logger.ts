import chalk from 'chalk';

export class logger {
  public static log(...message: any) {
    console.log(`${chalk.gray('[*] LOG')}`, ...message);
  }

  public static debug(...message: any) {
    console.debug(`${chalk.yellow('[*] DEBUG')}`, ...message);
  }

  public static flag(flag: any) {
    console.info(`${chalk.cyan('[+] FLAG')} ${flag}`);
  }

  public static info(...message: any) {
    console.info(`${chalk.blueBright('[*] INFO')}`, ...message);
  }

  public static success(...message: any) {
    console.info(`${chalk.greenBright('[+] SUCCESS')}`, ...message);
  }

  public static error(...message: any) {
    console.error(`${chalk.red('[-] ERROR')}`, ...message);
  }

  public static fatal(message: any) {
    console.error(
      `${chalk.red('[-] FATAL')} ${chalk.redBright(message.toString())}`,
    );
    process.exit(1);
  }

  public static raw(...message: any) {
    console.log(message);
  }
}
