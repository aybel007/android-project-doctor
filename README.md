# Android Project Doctor

A lightweight command-line diagnostic tool that helps Android developers inspect project configuration and identify common setup problems.

## Features

- Android project file validation
- Gradle build configuration detection
- Groovy Gradle DSL analysis
- Kotlin Gradle DSL analysis
- Android SDK path detection
- Android platform validation
- Android Build Tools validation
- Java version detection
- Gradle wrapper version detection
- Automated tests using Node.js

## Requirements

- Node.js 18 or later
- Android project directory
- Android SDK (optional for project-only checks)

## Getting Started

Clone the repository:

```bash
git clone https://github.com/aybel007/android-project-doctor.git
```

Enter the project:

```bash
cd android-project-doctor
```

## Usage

Run the diagnostic tool:

```bash
node src/index.js /path/to/your/android/project
```

Example:

```bash
node src/index.js tests/sample-android
```

For Kotlin DSL testing:

```bash
node src/index.js tests/sample-kotlin
```

## Running Tests

Run the automated test suite:

```bash
npm test
```

Check JavaScript syntax:

```bash
node --check src/index.js
```

## Project Structure

```text
android-project-doctor/
├── .github/
│   └── workflows/
│       └── tests.yml
├── src/
│   └── index.js
├── tests/
│   ├── sample-android/
│   ├── sample-incomplete/
│   ├── sample-kotlin/
│   └── gradle-analysis.test.js
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

## Current Development Status

Android Project Doctor is under active development.

The current version focuses on Android project structure, SDK environment checks, and Gradle configuration analysis.

More diagnostic features and improvements are planned.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

Please open an issue before submitting major changes.

## License

This project is licensed under the ISC License.

See the LICENSE file for details.

## Author

Aybel

GitHub: https://github.com/aybel007
