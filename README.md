# ANACEO — sitio institucional

Sitio estático de la Asociación Nacional Científica de Estudiantes de Odontología de Chile.

## Secciones

- `index.html`: portada y contacto.
- `organizacion.html`: misión, funciones y gobierno institucional.
- `sociedades.html`: directorio y proceso de adhesión.
- `investigacion.html`: Manual Práctico y oportunidades científicas.
- `eventos.html`: CONADEO, SOBE y archivo de encuentros.
- `transparencia.html`: estado de documentos institucionales.
- `privacy-policy.html` y `terms-of-use.html`: información legal.

El sitio no utiliza dependencias, cookies ni analítica. El formulario prepara un correo en el dispositivo del visitante; no almacena datos.

## Editar una vez, actualizar todas las páginas

El sitio sigue siendo HTML, CSS y JavaScript, sin frameworks ni paquetes externos.
Un pequeño script de JavaScript compone los HTML antes de publicarlos. El navegador
recibe páginas completas: el header y el footer no dependen de descargas adicionales
ni de JavaScript para aparecer.

- `src/partials/header.html`: marca, menú y enlace para saltar al contenido.
- `src/partials/footer.html`: pie completo, enlaces institucionales y crédito de SolvIT.
- `src/partials/head.html`: configuración común, icono y hoja de estilos.
- `src/partials/scripts.html`: scripts comunes.
- `src/pages/*.html`: contenido y metadatos propios de cada página.
- `css/styles.css` y `js/main.js`: presentación e interacciones compartidas.

Cada fuente incluye los componentes con `{{> header}}`, `{{> footer}}`, etc.
El generador conserva el header transparente de la portada, usa el header sólido
en las páginas internas, marca automáticamente la sección actual y resuelve
Contacto a la portada cuando corresponde. Las páginas legales usan el mismo pie completo.
Las versiones de CSS y JS se calculan desde su contenido para evitar cachés antiguas.

Después de editar una fuente o componente, con Node.js instalado:

```sh
node scripts/build.mjs
node scripts/build.mjs --check
node scripts/verify.mjs
node --test scripts/build.test.mjs
```

Los ocho HTML de la raíz son **archivos generados**: no editarlos a mano.
Se guardan en el repositorio para conservar el alojamiento estático actual.
Para agregar una página, crear `src/pages/nombre.html` con los cuatro includes,
añadirla al menú si corresponde y actualizar `sitemap.xml`.

Para previsualizar, servir la raíz con cualquier servidor estático, por ejemplo
`python -m http.server 4173 --bind 127.0.0.1` y abrir `http://127.0.0.1:4173`.
Publicar los HTML generados de la raíz, `css/`, `js/`, `assets/`, `robots.txt`
y `sitemap.xml`. No es necesario subir `src/`, `scripts/` ni instalar Node.js en el hosting.
La comprobación automática del repositorio detecta páginas que no se regeneraron.

## Estado del contenido

- Publicado en el proyecto: canales oficiales, Directiva 2026, 25 sociedades, Manual Práctico (segunda edición) y datos confirmados de CONADEO 2026.
- Pendiente de confirmación: fecha exacta, bases, programa e inscripciones de CONADEO.
- En preparación: memoria institucional 2026.
- No público: escritura de constitución, estatutos y convenios institucionales.
- Estado jurídico informado: personalidad jurídica aún no obtenida.

Los RUT y demás identificadores personales no se publican en el sitio.
