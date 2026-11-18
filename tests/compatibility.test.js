
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  checkCompatibility,
  parseJavaMajor,
  compareVersions
} = require("../src/compatibility");

test("Compatible AGP, Gradle and Java versions", () => {
  const result = checkCompatibility({
    agpVersion: "8.7.3",
    gradleVersion: "8.9",
    javaVersion: 21
  });

  assert.equal(result.status, "compatible");

  assert.ok(
    result.checks.every(
      check => check.status === "compatible"
    )
  );
});

test("Detects incompatible AGP and Gradle versions", () => {
  const result = checkCompatibility({
    agpVersion: "8.7.3",
    gradleVersion: "8.8",
    javaVersion: 21
  });

  assert.equal(result.status, "incompatible");
});

test("Detects incompatible Java and Gradle versions", () => {
  const result = checkCompatibility({
    agpVersion: "8.7.3",
    gradleVersion: "8.4",
    javaVersion: 21
  });

  assert.equal(result.status, "incompatible");
});

test("Detects Java below AGP 8 minimum", () => {
  const result = checkCompatibility({
    agpVersion: "8.7.3",
    gradleVersion: "8.9",
    javaVersion: 11
  });

  assert.equal(result.status, "incompatible");
});

test("Handles missing version information", () => {
  const result = checkCompatibility({
    agpVersion: null,
    gradleVersion: null,
    javaVersion: null
  });

  assert.equal(result.status, "unknown");
});

test("Parses Java version formats", () => {
  assert.equal(
    parseJavaMajor('openjdk version "21.0.11"'),
    21
  );

  assert.equal(
    parseJavaMajor('java version "1.8.0_392"'),
    8
  );

  assert.equal(
    parseJavaMajor("openjdk 17.0.12"),
    17
  );
});

test("Compares Gradle versions correctly", () => {
  assert.equal(compareVersions("8.9", "8.9"), 0);
  assert.equal(compareVersions("8.10", "8.9"), 1);
  assert.equal(compareVersions("8.8", "8.9"), -1);
  assert.equal(compareVersions("8.10.2", "8.10"), 1);
});
