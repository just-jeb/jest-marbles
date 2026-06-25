import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2015',
  external: ['jest', 'jest-diff', 'jest-matcher-utils', /^expect(\/.*)?$/, /^rxjs(\/.*)?$/],
});
