import axios, {
  type CreateAxiosDefaults,
  type AxiosResponse,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { logger } from '@utils';

let DEBUG = false;

interface ExtendedAxiosInstance extends AxiosInstance {
  getCookie(key: string): string | undefined;
  deleteCookie(key: string): boolean;
  setCookie(key: string, value: string, options?: Partial<CookieOptions>): void;
  getAllCookies(): { [key: string]: string };
  deleteAllCookies(): void;
  setHeader(name: string, value: string): void;
  deleteHeader(name: string): void;
  getHeader(name: string): string | undefined;
}

interface ExtendedCreateAxiosDefaults extends CreateAxiosDefaults {
  /**
   * Ignore All Http Errors
   */
  ignoreHttpErrors?: boolean;
  /**
   * Enable Debug Mode
   */
  DEBUG?: boolean;
}

interface CookieOptions {
  value: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

function parseSetCookieHeader(header: string): [string, CookieOptions] {
  const [cookiePair, ...options] = header.split(';');
  const [name, value] = cookiePair.split('=', 2);
  const cookieOptions: CookieOptions = {
    value: decodeURIComponent(value.trim()),
  };

  options.forEach((option) => {
    const [key, val] = option.trim().split('=', 2);
    const lowercaseKey = key.toLowerCase();
    switch (lowercaseKey) {
      case 'expires':
        cookieOptions.expires = new Date(val);
        break;
      case 'max-age':
        cookieOptions.maxAge = parseInt(val, 10);
        break;
      case 'domain':
        cookieOptions.domain = val;
        break;
      case 'path':
        cookieOptions.path = val;
        break;
      case 'secure':
        cookieOptions.secure = true;
        break;
      case 'httponly':
        cookieOptions.httpOnly = true;
        break;
      case 'samesite':
        cookieOptions.sameSite = val.toLowerCase() as 'strict' | 'lax' | 'none';
        break;
    }
  });

  return [name.trim(), cookieOptions];
}

function isExpired(options: CookieOptions): boolean {
  if (options.expires && options.expires < new Date()) return true;
  if (options.maxAge !== undefined && options.maxAge <= 0) return true;
  return false;
}

function handleSetCookieHeaders(
  store: Map<string, CookieOptions>,
  headers: any,
) {
  const setCookieHeader = headers['set-cookie'];
  if (setCookieHeader) debug('Received set-cookie headers', setCookieHeader);
  if (Array.isArray(setCookieHeader)) {
    setCookieHeader.forEach((cookieString: string) => {
      const [name, options] = parseSetCookieHeader(cookieString);
      store.set(name, options);
    });
  } else if (typeof setCookieHeader === 'string') {
    const [name, options] = parseSetCookieHeader(setCookieHeader);
    store.set(name, options);
  }
}

function debug(...args: any[]) {
  if (DEBUG) logger.debug('[axios extended]', ...args);
}

export function create(
  config?: ExtendedCreateAxiosDefaults,
): ExtendedAxiosInstance {
  if (config?.DEBUG) {
    DEBUG = true;
  }

  const store = new Map<string, CookieOptions>();
  const instance = axios.create(config) as ExtendedAxiosInstance;
  debug('Instance creadted with config', config);

  if (config?.ignoreHttpErrors) {
    debug('Enabled ignoreHttpErrors');
    instance.defaults.validateStatus = (status) =>
      status < 300 || status >= 400; //* ignore redirections
  }

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      (config as InternalAxiosRequestConfig & { duration: Date }).duration =
        new Date();

      debug(`Requesting ${config.url} with cookies`, store.entries());

      const validCookies = Array.from(store.entries())
        .filter(([_, options]) => !isExpired(options))
        .map(
          ([key, options]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(options.value)}`,
        );

      if (validCookies.length > 0) {
        config.headers.set('Cookie', validCookies.join('; '));
      }

      if (config.maxRedirects || config.maxRedirects === 0) {
        config.validateStatus = (status) => status >= 200 && status < 400; //* disable auto cookie handling
      } else {
        //* disable redirect to handle cookies (enabled by default)
        config.maxRedirects = 0;
      }

      return config;
    },
    (error) => {
      debug('Error request', error.config);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      debug(
        `Received response from ${response.config.url}, ${response.status} (${response.statusText}), ${new Date().getTime() - (response.config as InternalAxiosRequestConfig & { duration: Date }).duration.getTime()}ms`,
      );
      handleSetCookieHeaders(store, response.headers);
      return response;
    },
    (error: { response: AxiosResponse }) => {
      //* only support 301, 302, 303  (GET method)
      if (error.response && [301, 302, 303].includes(error.response.status)) {
        debug(
          `Received response from ${error.response.config.url}, ${error.response.status} (${error.response.statusText}), ${new Date().getTime() - (error.response.config as InternalAxiosRequestConfig & { duration: Date }).duration.getTime()}ms`,
        );
        handleSetCookieHeaders(store, error.response.headers);
        debug('Redirecting to', error.response.headers.location);
        return instance.get(error.response.headers.location);
      }
      debug('Error response', error.response);
      return Promise.reject(error);
    },
  );

  instance.getCookie = (key: string) => {
    const cookieOptions = store.get(key);
    return cookieOptions && !isExpired(cookieOptions)
      ? cookieOptions.value
      : undefined;
  };

  instance.deleteCookie = (key: string) => {
    return store.delete(key);
  };

  instance.setCookie = (
    key: string,
    value: string,
    options: Partial<CookieOptions> = {},
  ) => {
    store.set(key, { value, ...options });
  };

  instance.getAllCookies = () => {
    return Object.fromEntries(
      Array.from(store.entries())
        .filter(([_, options]) => !isExpired(options))
        .map(([key, options]) => [key, options.value]),
    );
  };

  instance.deleteAllCookies = () => {
    return store.clear();
  };

  instance.setHeader = (name: string, value: string) => {
    instance.defaults.headers.common[name] = value;
  };

  instance.deleteHeader = (name: string) => {
    delete instance.defaults.headers.common[name];
  };

  instance.getHeader = (name: string) => {
    return instance.defaults.headers.common[name] as string | undefined;
  };

  return instance;
}
