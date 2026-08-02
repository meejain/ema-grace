/**
 * A11y test configuration.
 *
 * wcagTags — axe-core rule tags to test against (WCAG 2.0–2.2 Level A + AA).
 * failOnImpact — violation impact levels that cause a non-zero exit (fail the build).
 *   moderate/minor are logged as warnings but never fail.
 * urls — relative paths tested in Mode 1 (`npm run test:a11y` with no argument),
 *   combined with A11Y_BASE_URL (default http://localhost:3000).
 *   Add one entry per unique block demo page and per unique page template.
 */
export default {
  wcagTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  failOnImpact: ['critical', 'serious'],
  urls: [
    '/',
  ],
};
