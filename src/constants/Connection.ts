export interface InitOptions {
  window: Window;
  connectionTimeout: number | boolean;
  timeout: number | boolean;
  debug: boolean;
}

export const defaultOptions: InitOptions = {
  window: window,
  connectionTimeout: false,
  timeout: false,
  debug: false,
};
