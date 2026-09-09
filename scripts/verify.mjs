import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFile(path.join(root, file), 'utf8');
const names = (await readdir(path.join(root, 'src/pages'))).filter((name) => name.endsWith('.html'));
const pages = new Map(await Promise.all(names.map(async (name) => [name, await read(name)])));
const ids = new Map();
for (const [name, html] of pages) {
  const values = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(values).size, values.length, `${name}: IDs duplicados`);
  ids.set(name, new Set(values));
}

let links = 0;
for (const [name, html] of pages) {
  const count = (pattern) => [...html.matchAll(pattern)].length;
  assert.equal(count(/<header\b[^>]*\bdata-header\b/g), 1, `${name}: header`);
  assert.equal(count(/<footer\b/g), 1, `${name}: footer`);
  assert.equal(count(/<main\b/g), 1, `${name}: main`);
  assert.equal(count(/<h1\b/g), 1, `${name}: h1`);
  assert.equal(count(/<title>/g), 1, `${name}: título`);
  assert.equal(count(/<meta name="description"/g), 1, `${name}: descripción`);
  assert.equal(count(/<meta name="viewport"/g), 1, `${name}: viewport`);
  assert.equal(count(/<meta charset=/g), 1, `${name}: charset`);
  assert.equal(count(/<link rel="canonical"/g), 1, `${name}: canonical`);
  assert.equal(count(/<link rel="stylesheet"/g), 1, `${name}: CSS`);
  assert.equal(count(/<script src="js\/main\.js\?v=[a-f0-9]{12}"><\/script>/g), 1, `${name}: JS versionado`);
  assert.ok(!/\{\{|\}\}/.test(html), `${name}: plantilla pendiente`);
  assert.equal(count(/href="https:\/\/solvit\.cl\/"/g), 1, `${name}: crédito SolvIT`);
  assert.match(html, /Página hecha por <a href="https:\/\/solvit\.cl\/">SolvIT<\/a>/);
  assert.ok(ids.get(name).has('contenido'), `${name}: destino del salto de contenido`);
  assert.ok(ids.get(name).has('nav-menu'), `${name}: destino del botón de menú`);
  assert.equal(/class="site-header header-solid"/.test(html), name !== 'index.html');
  const nav = html.match(/<nav\b[\s\S]*?<\/nav>/)[0];
  const current = [...nav.matchAll(/<a href="([^"]+)" aria-current="page"/g)];
  const inMenu = nav.includes(`href="${name}"`) && name !== 'index.html';
  assert.equal(current.length, inMenu ? 1 : 0, `${name}: sección activa`);
  if (inMenu) assert.equal(current[0][1], name);
  const contact = name === 'index.html' ? '#contacto' : 'index.html#contacto';
  assert.ok(nav.includes(`href="${contact}"`), `${name}: enlace Contacto`);

  for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) continue;
    const url = new URL(value.replaceAll('&amp;', '&'), `https://local.test/${name}`);
    const target = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    assert.ok(!target.startsWith('src/'), `${name}: enlace a una plantilla`);
    await access(path.join(root, target)).catch(() => assert.fail(`${name}: ${attribute} inexistente ${value}`));
    if (url.hash && ids.has(target)) {
      assert.ok(ids.get(target).has(decodeURIComponent(url.hash.slice(1))), `${name}: ancla inexistente ${value}`);
    }
    links++;
  }
}
const sitemap = await read('sitemap.xml');
const sitemapPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname.slice(1) || 'index.html');
assert.deepEqual(sitemapPages.sort(), [...names].sort(), 'El sitemap debe incluir todas las páginas.');
console.log(`${pages.size} páginas, ${links} referencias locales y sitemap verificados.`);
