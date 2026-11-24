// Runs the unit tests with coverage and writes a path-sanitized report to reports/tests/.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outputDir = join(root, 'reports', 'tests');
const workDir = mkdtempSync(join(tmpdir(), 'test-report-'));
const resultsFile = join(workDir, 'results.json');

const run = spawnSync(
  process.execPath,
  [
    join(root, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'),
    'test',
    '--no-watch',
    '--coverage',
    '--coverage-reporters=json-summary',
    '--reporters=default',
    '--reporters=json',
    `--output-file=${resultsFile}`,
  ],
  { cwd: root, stdio: 'inherit' },
);

const results = JSON.parse(readFileSync(resultsFile, 'utf8'));
const coverage = JSON.parse(
  readFileSync(join(root, 'coverage', 'angular-interview-prep', 'coverage-summary.json'), 'utf8'),
).total;
rmSync(workDir, { recursive: true, force: true });

const suites = results.testResults
  .map((suite) => ({
    file: relative(root, suite.name),
    tests: suite.assertionResults.length,
    passed: suite.assertionResults.filter((test) => test.status === 'passed').length,
    failed: suite.assertionResults.filter((test) => test.status === 'failed').length,
  }))
  .sort((a, b) => a.file.localeCompare(b.file));

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const report = {
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  node: process.version,
  runner: `vitest ${JSON.parse(readFileSync(join(root, 'node_modules/vitest/package.json'), 'utf8')).version}`,
  success: results.success && run.status === 0,
  totals: {
    suites: results.numTotalTestSuites,
    tests: results.numTotalTests,
    passed: results.numPassedTests,
    failed: results.numFailedTests,
    skipped: results.numPendingTests,
  },
  coveragePercent: {
    statements: coverage.statements.pct,
    branches: coverage.branches.pct,
    functions: coverage.functions.pct,
    lines: coverage.lines.pct,
  },
  files: suites,
};

const markdown = [
  '# Test Report',
  '',
  `- Version: ${report.version}`,
  `- Generated: ${report.generatedAt}`,
  `- Runtime: Node ${report.node}, ${report.runner}, jsdom`,
  `- Result: ${report.success ? 'PASS' : 'FAIL'}`,
  `- Tests: ${report.totals.passed} passed, ${report.totals.failed} failed, ${report.totals.skipped} skipped, ${report.totals.tests} total`,
  `- Coverage: ${report.coveragePercent.statements}% statements, ${report.coveragePercent.branches}% branches, ${report.coveragePercent.functions}% functions, ${report.coveragePercent.lines}% lines`,
  '',
  '| Test file | Tests | Passed | Failed |',
  '| --- | ---: | ---: | ---: |',
  ...suites.map((s) => `| \`${s.file}\` | ${s.tests} | ${s.passed} | ${s.failed} |`),
  '',
].join('\n');

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(outputDir, 'latest.md'), markdown);
process.exit(report.success ? 0 : 1);
