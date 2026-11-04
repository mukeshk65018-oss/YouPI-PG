import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dashboardUrl = new URL('../apps/family-dashboard/index.html', import.meta.url);
const readmeUrl = new URL('../apps/family-dashboard/README.md', import.meta.url);

test('family dashboard is clearly identified as a synthetic demo', async () => {
  const html = await readFile(dashboardUrl, 'utf8');
  const readme = await readFile(readmeUrl, 'utf8');

  assert.match(html, /DEMO DATA ONLY/i);
  assert.match(html, /Synthetic records only/i);
  assert.match(html, /Live payment processing/i);
  assert.match(html, /DEMO DATA ONLY/i);
  assert.match(html, /Synthetic examples — no money moved/i);
  assert.match(html, /NO LIVE PAYMENT PROCESSING/i);
  assert.match(readme, /synthetic demonstration data/i);
  assert.match(readme, /does not call the payment API, database, bank/i);
});

test('family dashboard includes core accessibility and usability safeguards', async () => {
  const html = await readFile(dashboardUrl, 'utf8');
  assert.match(html, /Skip to dashboard content/);
  assert.match(html, /aria-label=\"Dashboard sections\"/);
  assert.match(html, /aria-live=\"polite\"/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /:focus-visible/);
});

test('static family dashboard does not make unauthenticated network requests', async () => {
  const html = await readFile(dashboardUrl, 'utf8');

  // This dashboard is hosted as a public static GitHub Pages preview. Until a
  // separately authenticated, least-privilege family API exists, it must not
  // call gateway endpoints or attempt to send credentials from browser code.
  assert.doesNotMatch(html, /\bfetch\s*\(/i);
  assert.doesNotMatch(html, /\bXMLHttpRequest\b/i);
  assert.doesNotMatch(html, /\bWebSocket\s*\(/i);
  assert.doesNotMatch(html, /\bEventSource\s*\(/i);
  assert.doesNotMatch(html, /Authorization\s*:/i);
  assert.doesNotMatch(html, /X-Merchant-Key/i);
});
