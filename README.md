# Riesgo de siniestro fatal · Bogotá

Prototipo académico de la Tutoría 5 de Machine Learning I (Universidad EAN). Un modelo de regresión logística entrenado en Google Colab con datos abiertos de siniestros viales de Bogotá, publicado como sitio estático en GitHub Pages. El modelo corre completo en el navegador de quien visita la página: ningún dato del formulario sale de su equipo.

## Qué hace

Estima la probabilidad de que un siniestro reportado tenga personas fallecidas a partir de cuatro datos del reporte: clase de siniestro, localidad, franja horaria y día de la semana. La compara con la tasa base de 2019. Apoya la priorización de la respuesta; no la reemplaza.

## Tres rutas de despliegue, el mismo modelo

| Ruta | Archivo | Qué lo ejecuta |
|---|---|---|
| ONNX | `modelo/modelo.onnx` | ONNX Runtime Web 1.20.1 |
| Pesos en JSON | `modelo/modelo_pesos.json` | La fórmula de la regresión logística en `ruta_json.js` |
| Pyodide | `modelo/modelo.joblib` | Pyodide 0.27.7 con scikit-learn |

El botón «Verificar con los casos de prueba» recalcula `modelo/casos_prueba.json` por las tres rutas y muestra la diferencia frente a Colab.

## Estructura

```
index.html          página
estilos.css         estilos
app.js              formulario, ficha del modelo y verificación
ruta_onnx.js        ruta 1
ruta_json.js        ruta 2
ruta_pyodide.js     ruta 3
modelo/             los cinco archivos que exporta el cuaderno de Colab
CLAUDE.md           instrucciones para Claude Code sobre este proyecto
BITACORA_IA.md      registro del uso de inteligencia artificial
```

## Probar en su equipo

La página lee archivos con `fetch`, que no funciona si se abre `index.html` con doble clic. Desde esta carpeta:

```
python -m http.server 8000
```

y abra http://localhost:8000.

## Datos y licencia

Secretaría Distrital de Movilidad. (2021). *Histórico Siniestros Bogotá D.C* [Conjunto de datos]. Datos Abiertos Bogotá. https://datosabiertos.bogota.gov.co/dataset/historico-siniestros-bogota-d-c

La fuente se actualizó por última vez en 2021. El modelo sirve para aprender a desplegar, no como diagnóstico actual de la movilidad de Bogotá.
