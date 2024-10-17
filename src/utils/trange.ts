import chalk from 'chalk';
import readline from 'readline';

export function* trange(
  start: number,
  end: number,
  step = 1,
  log = 'Progress',
) {
  const total = Math.ceil((end - start) / step);
  let current = start;
  let count = 0;

  while (current < end) {
    count++;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    const progress = ((count / total) * 100).toFixed(2);
    process.stdout.write(
      `${chalk.blue('[*] INFO')} ${log}: ${progress}% [${count}/${total}]`,
    );

    yield current;
    current += step;
  }

  console.log();
}
