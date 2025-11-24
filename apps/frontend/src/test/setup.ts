import { vi } from 'vitest';
import { config } from '@vue/test-utils';
import '@vue/test-utils';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
// @ts-ignore
global.localStorage = localStorageMock;

// Configure Vue Test Utils
config.global.mocks = {
  $t: (key: string) => key,
  $route: {
    path: '/',
    params: {},
    query: {},
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
};

// Global test utilities
// @ts-ignore
global.describe = describe;
// @ts-ignore
global.it = it;
// @ts-ignore
global.test = test;
// @ts-ignore
global.expect = expect;
// @ts-ignore
global.vi = vi;
