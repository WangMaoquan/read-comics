import type { MockInstance } from 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface CustomMatchers<R = unknown> {
  toHaveBeenWarned(): R;
  toHaveBeenWarnedLast(): R;
  toHaveBeenWarnedTimes(n: number): R;
}

let warn: MockInstance;
const asserted: Set<string> = new Set();

beforeEach(() => {
  asserted.clear();
  warn = vi.spyOn(console, 'warn');
  warn.mockImplementation(() => {});
});

afterEach(() => {
  const assertedArray = Array.from(asserted);
  const nonAssertedWarnings = warn.mock.calls
    .map((args) => args[0])
    .filter((received) => {
      return !assertedArray.some((assertedMsg) => {
        return received.includes(assertedMsg);
      });
    });
  warn.mockRestore();
  if (nonAssertedWarnings.length) {
    throw new Error(
      `test case threw unexpected warnings:\n - ${nonAssertedWarnings.join(
        '\n - ',
      )}`,
    );
  }
});
