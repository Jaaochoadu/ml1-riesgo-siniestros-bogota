# Instrucciones para Claude Code · sitio del modelo

Este archivo lo lee Claude Code al abrir la carpeta. Describe el proyecto y las reglas que no se negocian.

## Qué es

Un sitio estático para GitHub Pages que ejecuta en el navegador un modelo entrenado en Google Colab. No hay servidor: GitHub Pages solo entrega archivos.

- `modelo/` contiene los archivos que exporta el cuaderno de Colab. **No se editan a mano**: si el modelo cambia, se reemplazan por los nuevos archivos exportados.
- Las columnas de entrada del modelo y las opciones del formulario están en `modelo/ficha_modelo.json`. Se leen de ahí; nunca se escriben a mano en el HTML.

## Reglas

1. Todo se calcula en el navegador. No agregar servidores, bases de datos ni servicios externos que reciban los datos del formulario.
2. Ninguna clave, token ni contraseña en ningún archivo: este repositorio es público.
3. No subir datos de entrenamiento al repositorio. Solo los archivos del modelo y su ficha.
4. Las bibliotecas externas se cargan desde un CDN con versión fija (por ejemplo `onnxruntime-web@1.20.1`), nunca con «latest».
5. Después de cualquier cambio en el cálculo, abrir la página con `python -m http.server 8000` y comprobar con el botón «Verificar con los casos de prueba» que la diferencia frente a Colab es menor que 0,00001.
6. Textos de la página en español, con lenguaje inclusivo. La ficha del modelo siempre visible, con su uso previsto, lo que no se debe hacer con el modelo y sus límites.
7. Antes de cada `git push`, mostrar a la persona la lista de archivos que se van a subir y esperar su confirmación.
8. Registrar en `BITACORA_IA.md` cada pedido importante: qué se pidió, qué se aceptó y qué se corrigió.
