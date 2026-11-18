
const AGP_MIN_GRADLE = {
  "8.0": "8.0",
  "8.1": "8.0",
  "8.2": "8.2",
  "8.3": "8.4",
  "8.4": "8.6",
  "8.5": "8.7",
  "8.6": "8.7",
  "8.7": "8.9",
  "8.8": "8.10.2",
  "8.9": "8.11.1",
  "8.10": "8.11.1",
  "8.11": "8.13",
  "8.12": "8.13",
  "8.13": "8.13",
  "9.0": "9.1.0",
  "9.1": "9.3.1",
  "9.2": "9.4.1",
  "9.3": "9.5.0",
  "9.4": "9.6.0"
};

const JAVA_MIN_GRADLE = {
  17: "7.3",
  18: "7.5",
  19: "7.6",
  20: "8.3",
  21: "8.5",
  22: "8.8",
  23: "8.10",
  24: "8.14",
  25: "9.1",
  26: "9.4",
  27: "9.8"
};

function versionParts(version) {
  if (!version) return null;

  const match = String(version).match(
    /^(\d+)\.(\d+)(?:\.(\d+))?/
  );

  return match
    ? match.slice(1, 4).map(value => Number(value || 0))
    : null;
}

function compareVersions(first, second) {
  const a = versionParts(first);
  const b = versionParts(second);

  if (!a || !b) return null;

  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }

  return 0;
}

function parseJavaMajor(output) {
  if (!output) return null;

  const match = String(output).match(
    /(?:version\s*)?["']?(\d+)(?:\.(\d+))?/i
  );

  if (!match) return null;

  const major = Number(match[1]);

  return major === 1
    ? Number(match[2])
    : major;
}

function createCheck(name, status, message) {
  return { name, status, message };
}

function checkCompatibility({
  agpVersion,
  gradleVersion,
  javaVersion
}) {
  const checks = [];

  const agp = versionParts(agpVersion);
  const gradle = versionParts(gradleVersion);
  const java = Number.isInteger(javaVersion)
    ? javaVersion
    : parseJavaMajor(javaVersion);

  // AGP and Gradle compatibility
  if (!agp || !gradle) {
    checks.push(createCheck(
      "AGP / Gradle",
      "unknown",
      "AGP or Gradle version could not be detected."
    ));
  } else {
    const agpKey = `${agp[0]}.${agp[1]}`;
    const minimum = AGP_MIN_GRADLE[agpKey];

    if (!minimum) {
      checks.push(createCheck(
        "AGP / Gradle",
        "unknown",
        `No compatibility rule available for AGP ${agpVersion}.`
      ));
    } else if (compareVersions(gradleVersion, minimum) >= 0) {
      checks.push(createCheck(
        "AGP / Gradle",
        "compatible",
        `Gradle ${gradleVersion} meets the minimum ${minimum} required by AGP ${agpVersion}.`
      ));
    } else {
      checks.push(createCheck(
        "AGP / Gradle",
        "incompatible",
        `AGP ${agpVersion} requires Gradle ${minimum} or later.`
      ));
    }
  }

  // Java and Gradle compatibility
  if (!gradle || !Number.isInteger(java)) {
    checks.push(createCheck(
      "Java / Gradle",
      "unknown",
      "Java or Gradle version could not be detected."
    ));
  } else if (JAVA_MIN_GRADLE[java]) {
    const minimum = JAVA_MIN_GRADLE[java];

    checks.push(
      compareVersions(gradleVersion, minimum) >= 0
        ? createCheck(
            "Java / Gradle",
            "compatible",
            `Java ${java} can run Gradle ${gradleVersion}.`
          )
        : createCheck(
            "Java / Gradle",
            "incompatible",
            `Java ${java} requires Gradle ${minimum} or later.`
          )
    );
  } else {
    checks.push(createCheck(
      "Java / Gradle",
      "unknown",
      `No Java ${java} compatibility rule is available.`
    ));
  }

  // AGP 8.x JDK requirement
  if (agp && agp[0] === 8 && Number.isInteger(java)) {
    checks.push(
      java >= 17
        ? createCheck(
            "AGP / Java",
            "compatible",
            `AGP ${agpVersion} requires JDK 17 or later.`
          )
        : createCheck(
            "AGP / Java",
            "incompatible",
            `AGP ${agpVersion} requires JDK 17 or later.`
          )
    );
  } else {
    checks.push(createCheck(
      "AGP / Java",
      "unknown",
      "This AGP and Java combination is not covered by the current rules."
    ));
  }

  const status = checks.some(
    check => check.status === "incompatible"
  )
    ? "incompatible"
    : checks.some(check => check.status === "unknown")
      ? "unknown"
      : "compatible";

  return {
    status,
    checks
  };
}

module.exports = {
  checkCompatibility,
  parseJavaMajor,
  compareVersions
};
