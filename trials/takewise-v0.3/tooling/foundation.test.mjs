import { test } from "node:test";
import { strict as assert } from "node:assert";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { files, productState, workflowSafety } from "./foundation.mjs";
test("app detection activates on manifests or sources, independently", () => {
  const root = mkdtempSync(join(tmpdir(), "takewise-gate-"));
  try {
    assert.deepEqual(productState(root), { backend: false, frontend: false });
    mkdirSync(join(root, "frontend/src"), { recursive: true });
    assert.equal(productState(root).frontend, true);
    mkdirSync(join(root, "backend"));
    writeFileSync(join(root, "backend/composer.json"), "{}");
    assert.equal(productState(root).backend, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
const safe = () => ({
  on: {
    pull_request: null,
    push: null,
    workflow_dispatch: null,
    merge_group: null,
  },
  permissions: { contents: "read" },
  jobs: {
    quality: {
      name: "Takewise / quality",
      "runs-on": "ubuntu-24.04",
      "timeout-minutes": 20,
      steps: [{ uses: "actions/checkout@" + "a".repeat(40) }],
    },
  },
});
test("workflow policy rejects mutable actions, privileged triggers and skipped gate", () => {
  workflowSafety(safe(), "fixture");
  let doc = safe();
  doc.jobs.quality.steps[0].uses = "actions/checkout@main";
  assert.throws(() => workflowSafety(doc, "fixture"), /immutable SHA/);
  doc = safe();
  doc.on.pull_request_target = null;
  assert.throws(() => workflowSafety(doc, "fixture"), /privileged/);
  doc = safe();
  doc.jobs.quality.if = false;
  assert.throws(() => workflowSafety(doc, "fixture"), /unconditionally/);
});

import { checkVitest, checkPlaywright } from "./test-report.mjs";
test("test report guards reject zero executed tests and skips", () => {
  assert.throws(() => checkVitest({ numTotalTests: 0 }), /zero/);
  assert.throws(
    () =>
      checkVitest({
        numTotalTests: 1,
        numPassedTests: 0,
        numPendingTests: 1,
        numFailedTests: 0,
      }),
    /without skips/,
  );
  checkVitest({
    numTotalTests: 1,
    numPassedTests: 1,
    numPendingTests: 0,
    numFailedTests: 0,
  });
  assert.throws(() => checkPlaywright({ stats: { expected: 0 } }), /zero/);
  assert.throws(
    () =>
      checkPlaywright({
        stats: { expected: 1, unexpected: 0, skipped: 1, flaky: 0 },
      }),
    /no failures/,
  );
  checkPlaywright({
    stats: { expected: 1, unexpected: 0, skipped: 0, flaky: 0 },
  });
});

test("local ignored environment files do not break foundation path checks", () => {
  const root = mkdtempSync(join(tmpdir(), "takewise-env-"));
  try {
    writeFileSync(join(root, ".env"), "LOCAL_ONLY=fixture");
    writeFileSync(join(root, ".env.local"), "LOCAL_ONLY=fixture");
    writeFileSync(join(root, ".env.example"), "LOCAL_ONLY=");
    assert.deepEqual(files(root), [join(root, ".env.example")]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
