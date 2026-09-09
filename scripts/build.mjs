import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
// Git may check out CRLF on Windows and LF on the host. Hash and render the same text.
const read = async (name) => (await readFile(path.join(root, name), 'utf8')).replaceAll('\r\n', '\n');
const check = process.argv.includes('--check');
const pages = (await readdir(path.join(root, 'src/pages'))).filter((name) => name.endsWith('.html')).sort();
if (!pages.includes('index.html')) throw new Error('Falta src/pages/index.html.');

const versions = {};
for (const asset of ['css/styles.css', 'js/main.js']) {
  versions[asset] = createHash('sha256').update(await read(asset)).digest('hex').slice(0, 12);
}

async function render(source, page, stack = []) {
  const include = /\{\{>\s*([a-z][a-z0-9-]*)\s*\}\}/g;
  const matches = [...source.matchAll(include)];
  for (const [token, name] of matches) {
    if (stack.includes(name)) throw new Error(`Inclusión circular: ${[...stack, name].join(' > ')}`);
    const partial = await read(`src/partials/${name}.html`);
    source = source.replace(token, await render(partial.trimEnd(), page, [...stack, name]));
  }
  const values = {
    headerClass: page === 'index.html' ? '' : ' header-solid',
    contactHref: page === 'index.html' ? '#contacto' : 'index.html#contacto',
    cssVersion: versions['css/styles.css'],
    jsVersion: versions['js/main.js'],
  };
  source = source.replace(/\{\{current:([a-z-]+\.html)\}\}/g, (_, target) => {
    if (!pages.includes(target)) throw new Error(`Página de navegación inexistente: ${target}`);
    return target === page ? ' aria-current="page"' : '';
  });
  source = source.replace(/\{\{(\w+)\}\}/g, (token, name) => {
    if (!Object.hasOwn(values, name)) throw new Error(`Variable desconocida: ${token}`);
    return values[name];
  });
  if (/\{\{|\}\}/.test(source)) throw new Error(`Plantilla sin resolver en ${page}.`);
  return source;
}

// Render everything before writing, so a broken partial cannot leave half the site updated.
const outputs = await Promise.all(pages.map(async (page) => {
  const source = await read(`src/pages/${page}`);
  for (const name of ['head', 'header', 'footer', 'scripts']) {
    if (!source.includes(`{{> ${name}}}`)) throw new Error(`${page}: falta el componente ${name}.`);
  }
  return [page, await render(source, page)];
}));

const rootPages = (await readdir(root)).filter((name) => name.endsWith('.html'));
for (const page of rootPages) {
  if (!pages.includes(page)) throw new Error(`${page} no tiene fuente en src/pages. Revisa antes de eliminarla.`);
}
for (const [page, html] of outputs) {
  if (check) {
    const existing = await read(page);
    if (existing.replaceAll('\r\n', '\n') !== html.replaceAll('\r\n', '\n')) {
      throw new Error(`${page} está desactualizada. Ejecuta node scripts/build.mjs.`);
    }
  } else {
    await writeFile(path.join(root, page), html, 'utf8');
  }
}
console.log(`${pages.length} páginas ${check ? 'verificadas' : 'generadas'} sin dependencias.`);
