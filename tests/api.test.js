const test = require("node:test");
const assert = require("node:assert/strict");

const doctor = require("../src/index.js");

test("Android Project Doctor exports diagnose function", () => {
  assert.equal(typeof doctor.diagnose, "function");
});

test("Importing API does not automatically start a scan", () => {
  assert.ok(doctor.diagnose);
  assert.equal(typeof doctor.diagnose, "function");
});
test("JSON report returns correct project summary", () => {
  const report = doctor.getProjectReport("tests/sample-android");

  assert.equal(report.status, "passed");
  assert.equal(report.summary.total, 5);
  assert.equal(report.summary.passed, 5);
  assert.equal(report.summary.score, 100);
});

test("JSON report detects incomplete project", () => {
  const report = doctor.getProjectReport("tests/sample-incomplete");

  assert.equal(report.status, "warning");
  assert.equal(report.summary.passed, 1);
  assert.equal(report.summary.warnings, 4);
  assert.equal(report.summary.score, 20);
});

test("JSON report handles invalid directory", () => {
  const report = doctor.getProjectReport("invalid-project-folder");

  assert.equal(report.status, "error");
});
test("JSON report includes version compatibility results", () => {
  const report = doctor.getProjectReport("tests/sample-android");

  assert.equal(report.agpVersion, "8.7.3");
  assert.equal(report.gradleVersion, "8.9");
  assert.equal(report.javaVersion, 21);

  assert.equal(report.compatibility.status, "compatible");
  assert.equal(report.compatibility.checks.length, 3);

  for (const check of report.compatibility.checks) {
    assert.equal(check.status, "compatible");
  }
});
