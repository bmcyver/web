# Wargame utils for webhacking

Based on axios. Cookie is automatically handled.
And it has some useful functions like logger, hashes, random string, etc.

## Installation
```bash
pnpm install
```

## Usage
```ts
import { create } from './utils/'; // Must end with a slash

const r = create({ // based on axios instance
    baseURL: '<url>',
    ignoreHttpErrors: true, // Ignore all http errors (NOT network errors)
});
```