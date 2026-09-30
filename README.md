# English Lessons · Darlene Leguizamon

Sitio web de clases particulares de inglés, con test de nivel online.

Sitio estático (HTML, CSS y JavaScript sin dependencias). No tiene backend y el test no guarda ninguna respuesta.

## Estructura

```
index.html          Inicio, sobre mí y contacto
test.html           Test de nivel (15 preguntas, 20 minutos)
css/styles.css
js/main.js          Animaciones de entrada y año del footer
js/test.js          Lógica del test y temporizador
js/questions.js     Preguntas y respuestas correctas
assets/img/         Imágenes y favicon
```

## Ver en local

Abrí `index.html` en el navegador.

## Publicación

Se publica con GitHub Pages en cada push a la rama `main` (carpeta raíz), con el dominio propio:
https://englishlessons.com.ar/

El dominio está registrado en NIC Argentina y delegado a Cloudflare (DNS sin proxy), donde apunta a GitHub Pages.
