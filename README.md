# Android Project Doctor

A lightweight, open-source command-line diagnostic tool that helps Android developers inspect project configuration, validate SDK setup, and identify compatibility issues between Android Gradle Plugin (AGP), Gradle, and Java.

## Features

- Android project structure validation
- Groovy and Kotlin Gradle DSL detection
- Android SDK path detection
- Android platform validation
- Android Build Tools validation
- Java version detection
- Gradle wrapper version detection
- AGP, Gradle, and Java compatibility checks
- JSON diagnostic reports
- Automated tests using Node.js

## Requirements

- Node.js 18 or later
- An Android project directory
- Android SDK (optional for project structure and version checks)

## Installation

Clone the repository:

```bash
git clone https://github.com/aybel007/android-project-doctor.git
cd android-project-doctor
```

## Usage

Run a diagnostic scan:

```bash
node src/index.js /path/to/android/project
```

Example:

```bash
node src/index.js tests/sample-android
```

Generate a JSON report:

```bash
node src/index.js tests/sample-android --json
```

The JSON report includes:

- Project information
- Project file checks
- Detected AGP version
- Detected Gradle version
- Detected Java version
- Compatibility results
- Diagnostic summary

## Compatibility Checks

Android Project Doctor checks compatibility between:

1. Android Gradle Plugin and Gradle
2. Java and Gradle
3. Android Gradle Plugin and Java

Compatibility results are reported as:

- `compatible`
- `incompatible`
- `unknown`

An `unknown` result means the required version information or a supported compatibility rule is unavailable. It does not necessarily mean the project is incompatible.

## Running Tests

Run the automated test suite:

```bash
npm test
```

Check JavaScript syntax:

```bash
node --check src/index.js
node --check src/compatibility.js
```

## Project Structure

```text
android-project-doctor/
├── .github/
│   └── workflows/
│       └── tests.yml
├── src/
│   ├── index.js
│   └── compatibility.js
├── tests/
│   ├── api.test.js
│   ├── compatibility.test.js
│   ├── gradle-analysis.test.js
│   ├── sample-android/
│   ├── sample-incomplete/
│   ├── sample-kotlin/
│   └── sample-sdk/
├── LICENSE
├── README.md
└── package.json
```

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

Please read CONTRIBUTING.md before submitting changes.

## License

This project is licensed under the ISC License.
See the LICENSE file for details.

## Author

Aybel

GitHub: https://github.com/aybel007
