import { assert } from "./foundation.mjs";
export function checkVitest(report) {
  assert(report.numTotalTests > 0, "Vitest executed zero tests");
  assert(
    report.numPassedTests === report.numTotalTests &&
      report.numPendingTests === 0 &&
      report.numFailedTests === 0,
    "Vitest requires all discovered tests to pass without skips",
  );
}
export function checkPlaywright(report) {
  assert(report.stats?.expected > 0, "Playwright executed zero passing tests");
  assert(
    report.stats.unexpected === 0 &&
      report.stats.skipped === 0 &&
      report.stats.flaky === 0,
    "Playwright requires no failures, skips or flaky tests",
  );
}
