# Wargame utils for webhacking

Based on axios. Cookie is automatically handled.

And it has some useful functions like logger, hashes, random string, etc.

## Installation
```bash
pnpm install
```

## Usage
```ts
import { create, server } from '@web';
import { logger } from '@utils';

const r = create({ // based on axios instance
    baseURL: '<url>',
    ignoreHttpErrors: true,
    DEBUG: true,
});

const app = server({ // create express app with useful functions
  DEBUG: true,
  enableErrorHandler: true,
}).listen(3000);

app.get('/', async (req, res) => {
  logger.info('GET /');
});
```
