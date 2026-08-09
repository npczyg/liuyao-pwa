import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const localPath = (relativePath) => fileURLToPath(new URL(relativePath, root));

test('manifest and install icons are valid', async () => {
  const manifest = JSON.parse(await readFile(localPath('manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.name, '六爻排盘');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');

  for (const size of [180, 192, 512]) {
    const png = await readFile(localPath(`icons/icon-${size}.png`));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});

test('every precached PWA asset exists', async () => {
  const serviceWorker = await readFile(localPath('sw.js'), 'utf8');
  const paths = [...serviceWorker.matchAll(/'\.\/([^']*)'/g)].map((match) => match[1]);
  for (const path of paths.filter(Boolean)) await access(localPath(path));
});

test('application does not persist chart data', async () => {
  const sourceFiles = ['src/app.js', 'src/calendar.js', 'src/liuyao.js', 'src/export.js'];
  const source = (await Promise.all(sourceFiles.map((file) => readFile(localPath(file), 'utf8')))).join('\n');
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/);
});
