import axios, {
  type CreateAxiosDefaults,
  type AxiosResponse,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

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

interface ExtendedAxiosInstance extends AxiosInstance {
  getCookie(key: string): string | undefined;
  deleteCookie(key: string): boolean;
  setCookie(key: string, value: string, options?: Partial<CookieOptions>): void;
  getAllCookies(): { [key: string]: string };
  setHeader(name: string, value: string): void;
  deleteHeader(name: string): void;
  getHeader(name: string): string | undefined;
}

interface ExtendedCreateAxiosDefaults extends CreateAxiosDefaults {
  ignoreHttpError?: boolean;
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

export function create(
  config?: ExtendedCreateAxiosDefaults,
): ExtendedAxiosInstance {
  const store = new Map<string, CookieOptions>();
  const instance = axios.create(config) as ExtendedAxiosInstance;

  if (config?.ignoreHttpError) {
    instance.defaults.validateStatus = (status) =>
      status < 300 || status >= 400; //* ignore redirections
  }

  function isExpired(options: CookieOptions): boolean {
    if (options.expires && options.expires < new Date()) return true;
    if (options.maxAge !== undefined && options.maxAge <= 0) return true;
    return false;
  }

  function handleSetCookieHeaders(headers: any) {
    const setCookieHeader = headers['set-cookie'];
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

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
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
        config.validateStatus = (status) => status >= 200 && status < 400;
      } else {
        //* disable redirect to handle cookies
        config.maxRedirects = 0;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      handleSetCookieHeaders(response.headers);
      return response;
    },
    (error) => {
      //* only support 301, 302, 303  (GET method)
      if (error.response && [301, 302, 303].includes(error.response.status)) {
        handleSetCookieHeaders(error.response.headers);
        return instance.get(error.response.headers.location);
      }
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
