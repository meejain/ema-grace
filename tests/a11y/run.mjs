#!/usr/bin/env node
/**
 * run.mjs — entry for `npm run test:a11y [url]`.
 * If a URL argument is given, forwards it as A11Y_URL (Mode 2, single page).
 * Otherwise runs Mode 1 (the URL list in a11y.config.js).
 * Delegates to the Playwright test runner.
 */
import { spawnSync } from 'node:child_process';

const urlArg = process.argv[2];
const env = { ...process.env };
if (urlArg) env.A11Y_URL = urlArg;

const result = spawnSync(
  'npx',
  ['playwright', 'test', '--config', 'tests/a11y/playwright.config.js'],
  { stdio: 'inherit', env },
);

process.exit(result.status ?? 1);
