const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cli = path.join(root, "src", "index.js");

function scan(project) {
  const projectPath = path.join(root, "tests", project);

  return execFileSync(
    process.execPath,
    [cli, projectPath],
    {
      cwd: root,
      encoding: "utf8"
    }
  );
}

function verifyGradleConfig(output, fileName) {
  assert.ok(output.includes(`[INFO] Gradle file: ${fileName}`));
  assert.ok(output.includes("[PASS] AGP: 8.7.3"));
  assert.ok(output.includes("[PASS] compileSdk: 35"));
  assert.ok(output.includes("[PASS] minSdk: 23"));
  assert.ok(output.includes("[PASS] targetSdk: 35"));
}

test("Groovy Gradle configuration detection", () => {
  const output = scan("sample-android");

  verifyGradleConfig(output, "build.gradle");
});

test("Kotlin Gradle configuration detection", () => {
  const output = scan("sample-kotlin");

  verifyGradleConfig(output, "build.gradle.kts");
});
test("Missing SDK configuration is reported", () => {
  const output = scan("sample-incomplete");

  assert.ok(output.includes("[PASS] AGP: 8.7.3"));
  assert.ok(output.includes("[PASS] compileSdk: 35"));
  assert.ok(output.includes("[WARN] minSdk not detected."));
  assert.ok(output.includes("[WARN] targetSdk not detected."));
});
