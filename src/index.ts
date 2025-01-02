import { logger, trange } from '@utils';
import { create } from '@web';

logger.info('Creating web server...');

create({
  baseURL: 'http://localhost',
  DEBUG: true,
});
