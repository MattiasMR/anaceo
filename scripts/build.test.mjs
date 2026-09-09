import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('shared templates generate consistently and reject invalid input', (t) => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const fixture = mkdtempSync(path.join(tmpdir(), 'anaceo-build-test-'));
  const resolvedFixture = realpathSync(fixture);
  t.after(() => {
    // Delete only this exact temporary fixture, never the source checkout.
    assert.equal(realpathSync(fixture), resolvedFixture);
    assert.equal(path.dirname(resolvedFixture), realpathSync(tmpdir()));
    assert.ok(path.basename(resolvedFixture).startsWith('anaceo-build-test-'));
    rmSync(resolvedFixture, { recursive: true });
  });
  for (const directory of ['src', 'scripts', 'css', 'js']) {
    cpSync(path.join(root, directory), path.join(fixture, directory), { recursive: true });
  }
  const run = (...args) => spawnSync(process.execPath, [path.join(fixture, 'scripts/build.mjs'), ...args], {
    cwd: tmpdir(), encoding: 'utf8',
  });
  assert.equal(run().status, 0);
  assert.equal(run('--check').status, 0);

  // CRLF/LF must not change asset versions or generated HTML.
  function useWindowsLineEndings(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) useWindowsLineEndings(file);
      else writeFileSync(file, readFileSync(file, 'utf8').replaceAll('\r\n', '\n').replaceAll('\n', '\r\n'));
    }
  }
  for (const directory of ['src', 'css', 'js']) useWindowsLineEndings(path.join(fixture, directory));
  assert.equal(run('--check').status, 0, 'Windows/Linux output must match');

  const header = path.join(fixture, 'src/partials/header.html');
  const original = readFileSync(header, 'utf8');
  const before = readFileSync(path.join(fixture, 'index.html'), 'utf8');
  for (const invalid of ['{{> missing}}', '{{> header}}', '{{unknown}}', '{{current:missing.html}}']) {
    writeFileSync(header, invalid);
    assert.notEqual(run().status, 0, invalid);
    assert.equal(readFileSync(path.join(fixture, 'index.html'), 'utf8'), before, 'No partial writes after errors');
  }
  writeFileSync(header, original);

  const footer = path.join(fixture, 'src/partials/footer.html');
  const marker = '<!-- Shared footer test -->';
  writeFileSync(footer, readFileSync(footer, 'utf8') + marker);
  assert.notEqual(run('--check').status, 0, 'Stale pages must fail');
  assert.equal(run().status, 0);
  for (const page of readdirSync(path.join(fixture, 'src/pages'))) {
    assert.ok(readFileSync(path.join(fixture, page), 'utf8').includes(marker), `${page}: shared footer change`);
  }
  assert.equal(run('--check').status, 0);
});
