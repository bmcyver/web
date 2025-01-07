import { logger, randomStr, trange } from '@utils';
import { create, server } from '@web';

const r = create({
  DEBUG: true,
  baseURL: 'http://94.237.50.242:36495/',
});

const app = server({
  DEBUG: true,
  enableErrorHandler: true,
}).listen(3000);

app.get('/', async (req, res) => {
  logger.info('GET /');
});
