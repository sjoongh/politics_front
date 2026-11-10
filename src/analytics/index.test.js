import { analyticsEnabled } from './index';

jest.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => global.__native || false, getPlatform: () => (global.__native ? 'android' : 'web') },
}));

describe('analyticsEnabled', () => {
  const env = process.env;
  afterEach(() => { process.env = { ...env }; global.__native = false; });

  test('off in non-production by default (test env)', () => {
    expect(analyticsEnabled()).toBe(false);
  });
  test('REACT_APP_ANALYTICS=1 forces on, =0 forces off', () => {
    process.env.REACT_APP_ANALYTICS = '1';
    expect(analyticsEnabled()).toBe(true);
    process.env.REACT_APP_ANALYTICS = '0';
    expect(analyticsEnabled()).toBe(false);
  });
  test('production: on for prod host, off for other hosts, on for native webview', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.REACT_APP_ANALYTICS;
    expect(window.location.hostname).toBe('localhost');
    expect(analyticsEnabled()).toBe(false);
    global.__native = true;
    expect(analyticsEnabled()).toBe(true);
  });
});
