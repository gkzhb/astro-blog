import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

// Exercise the user's actual pnpm entry point, not npm exec or Astro directly.
// Foreground and untracked: Astro 7 auto-backgrounds inside agent harnesses.
// Opt out so cleanup cannot leave a daemon or stop a user's existing server.
const child = spawn('pnpm', ['dev', '--host', '127.0.0.1', '--port', '4337', '--ignore-lock'], {
  cwd: new URL('../', import.meta.url),
  detached: process.platform !== 'win32',
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
let done = false;
const stop = () => {
  try {
    if (process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
    else child.kill('SIGTERM');
  } catch {}
};
const timeout = setTimeout(() => {
  if (done) return;
  done = true;
  stop();
  console.error(output.slice(-6000));
  console.error('FAIL: direct pnpm dev did not start within 25 seconds');
  process.exitCode = 1;
}, 25000);
const inspect = async (chunk) => {
  output += chunk.toString();
  if (done || !/localhost:4337|127\.0\.0\.1:4337/.test(output)) return;
  done = true;
  clearTimeout(timeout);
  try {
    const response = await fetch('http://127.0.0.1:4337/', { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes('site-footer'));
    assert.ok(html.includes('gkzhb'));
    console.log('PASS: direct pnpm dev started and served the Minrock homepage (HTTP 200)');
  } catch (error) {
    console.error(output.slice(-6000));
    console.error(error);
    process.exitCode = 1;
  } finally { stop(); }
};
child.stdout.on('data', inspect);
child.stderr.on('data', inspect);
child.on('error', (error) => {
  done = true;
  clearTimeout(timeout);
  console.error(error);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  clearTimeout(timeout);
  if (!done) {
    done = true;
    console.error(output.slice(-6000));
    console.error(`FAIL: pnpm dev exited before readiness (code ${code})`);
    process.exitCode = 1;
  }
});
