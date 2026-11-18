
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 5000
  });

  if (result.error || result.status !== 0) {
    return null;
  }

  return (result.stdout || "").trim();
}

function getJavaVersion() {
  const output = runCommand("java", ["-version"]);

  // Java often prints its version to stderr.
  if (output) return output;

  const result = spawnSync("java", ["-version"], {
    encoding: "utf8",
    timeout: 5000
  });

  if (result.error || result.status !== 0) {
    return null;
  }

  return (result.stderr || result.stdout || "").trim();
}

function getGradleVersion(projectPath) {
  const propertiesPath = path.join(
    projectPath,
    "gradle/wrapper/gradle-wrapper.properties"
  );

  if (!fs.existsSync(propertiesPath)) {
    return null;
  }

  const content = fs.readFileSync(propertiesPath, "utf8");

  const match = content.match(
    /distributionUrl=.*gradle-([0-9][^-\/]*)-(?:bin|all)\.zip/
  );

  return match ? match[1] : null;
}

function hasNonEmptyFile(directory, names) {
  return names.some(name => {
    const file = path.join(directory, name);

    return fs.existsSync(file) &&
      fs.statSync(file).isFile() &&
      fs.statSync(file).size > 0;
  });
}


function checkAndroidSDK(projectPath) {
  console.log("\nANDROID SDK CHECKS\n");

  const localProperties = path.join(
    projectPath,
    "local.properties"
  );

  let sdkPath =
    process.env.ANDROID_HOME ||
    process.env.ANDROID_SDK_ROOT ||
    null;

  if (fs.existsSync(localProperties)) {
    const content = fs.readFileSync(
      localProperties,
      "utf8"
    );

    const match = content.match(/^sdk\.dir=(.+)$/m);

    if (match) {
      sdkPath = match[1].trim().replace(/\\/g, "/");

      console.log(
        "[INFO] SDK path found in local.properties"
      );
    }
  }

  if (!sdkPath) {
    console.log("[WARN] Android SDK path not configured.");
    return;
  }

  sdkPath = path.resolve(sdkPath);

  console.log("[INFO] SDK path:", sdkPath);

  if (!fs.existsSync(sdkPath) ||
      !fs.statSync(sdkPath).isDirectory()) {
    console.log("[WARN] SDK directory does not exist.");
    return;
  }

  const platforms = path.join(sdkPath, "platforms");
  const buildTools = path.join(sdkPath, "build-tools");

  // Validate Android platforms
  if (fs.existsSync(platforms)) {
    const versions = fs.readdirSync(platforms);

    for (const version of versions) {
      const platformPath = path.join(platforms, version);

      if (!fs.statSync(platformPath).isDirectory()) {
        continue;
      }

      const valid =
        hasNonEmptyFile(platformPath, ["android.jar"]) &&
        hasNonEmptyFile(platformPath, ["source.properties"]);

      if (valid) {
        console.log("[PASS] Valid Android platform:", version);
      } else {
        console.log("[WARN] Incomplete Android platform:", version);
      }
    }
  } else {
    console.log("[WARN] Android platforms directory missing.");
  }

  // Validate Android build tools
  if (fs.existsSync(buildTools)) {
    const versions = fs.readdirSync(buildTools);

    const requiredTools = [
      ["aapt", "aapt.exe"],
      ["aapt2", "aapt2.exe"],
      ["zipalign", "zipalign.exe"],
      ["apksigner", "apksigner.bat", "apksigner.exe"]
    ];

    for (const version of versions) {
      const toolsPath = path.join(buildTools, version);

      if (!fs.statSync(toolsPath).isDirectory()) {
        continue;
      }

      const missing = requiredTools.filter(
        alternatives =>
          !hasNonEmptyFile(toolsPath, alternatives)
      );

      if (!hasNonEmptyFile(toolsPath, ["source.properties"])) {
        missing.push(["source.properties"]);
      }

      if (missing.length === 0) {
        console.log("[PASS] Valid build tools:", version);
      } else {
        console.log("[WARN] Incomplete build tools:", version);

        missing.forEach(tool => {
          console.log("  Missing:", tool[0]);
        });
      }
    }
  } else {
    console.log("[WARN] Android build-tools directory missing.");
  }
}


function analyzeGradleConfig(projectPath) {
  console.log("\nGRADLE CONFIGURATION ANALYSIS\n");

  const possibleFiles = [
    "app/build.gradle",
    "app/build.gradle.kts"
  ];

  const gradleFile = possibleFiles
    .map(file => path.join(projectPath, file))
    .find(file => fs.existsSync(file));

  if (!gradleFile) {
    console.log("[WARN] App Gradle file not found.");
    return;
  }

  const content = fs.readFileSync(gradleFile, "utf8");

  console.log("[INFO] Gradle file:", path.basename(gradleFile));

  const patterns = {
    AGP: [
      /id\s*['"]com\.android\.application['"]\s*version\s*['"]([^'"]+)['"]/,
      /id\s*\(\s*['"]com\.android\.application['"]\s*\)\s*version\s*['"]([^'"]+)['"]/,
      /com\.android\.tools\.build:gradle:([^'"]+)/
    ],

    compileSdk: [
      /compileSdk(?:Version)?\s*(?:=\s*)?(\d+)/
    ],

    minSdk: [
      /minSdk(?:Version)?\s*(?:=\s*)?(\d+)/
    ],

    targetSdk: [
      /targetSdk(?:Version)?\s*(?:=\s*)?(\d+)/
    ]
  };

  for (const [name, regexList] of Object.entries(patterns)) {
    let value = null;

    for (const regex of regexList) {
      const match = content.match(regex);

      if (match) {
        value = match[1];
        break;
      }
    }

    if (value) {
      console.log("[PASS]", name + ":", value);
    } else {
      console.log("[WARN]", name, "not detected.");
    }
  }
}
function diagnose(projectPath) {
  const absolutePath = path.resolve(projectPath);

  console.log("\n==================================");
  console.log("       ANDROID PROJECT DOCTOR");
  console.log("==================================\n");

  if (!fs.existsSync(absolutePath) ||
      !fs.statSync(absolutePath).isDirectory()) {
    console.log("[ERROR] Project directory not found.");
    process.exitCode = 1;
    return;
  }

  const checks = [
    ["Gradle build file", [
      "build.gradle",
      "build.gradle.kts",
      "app/build.gradle",
      "app/build.gradle.kts"
    ]],
    ["Gradle settings", [
      "settings.gradle",
      "settings.gradle.kts"
    ]],
    ["Gradle wrapper", [
      "gradlew",
      "gradlew.bat"
    ]],
    ["Android Manifest", [
      "app/src/main/AndroidManifest.xml"
    ]],
    ["Gradle wrapper properties", [
      "gradle/wrapper/gradle-wrapper.properties"
    ]]
  ];

  let passed = 0;

  console.log("PROJECT FILE CHECKS\n");

  for (const [name, files] of checks) {
    const found = files.some(file =>
      fs.existsSync(path.join(absolutePath, file))
    );

    if (found) {
      console.log("[PASS]", name);
      passed++;
    } else {
      console.log("[WARN]", name, "not found");
    }
  }

  console.log("\nENVIRONMENT CHECKS\n");
checkAndroidSDK(absolutePath);
analyzeGradleConfig(absolutePath);
  const javaVersion = getJavaVersion();

  if (javaVersion) {
    console.log("[INFO] Java detected:");
    console.log(javaVersion.split("\n")[0]);
  } else {
    console.log("[WARN] Java is not installed or unavailable.");
  }

  const gradleVersion = getGradleVersion(absolutePath);

  if (gradleVersion) {
    console.log("[INFO] Gradle wrapper version:", gradleVersion);
  } else {
    console.log("[WARN] Gradle version could not be detected.");
  }

  const score = Math.round(
    (passed / checks.length) * 100
  );

  console.log("\n==================================");
  console.log("          SCAN SUMMARY");
  console.log("==================================");

  console.log(`Project checks: ${passed}/${checks.length}`);
  console.log(`File presence score: ${score}/100`);

  console.log("\nAndroid Project Doctor scan completed.\n");
}

diagnose(process.argv[2] || ".");

