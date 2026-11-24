// Conecta el formulario con las tres rutas y muestra la ficha del modelo.
// Todo ocurre en el navegador: ningún dato del formulario se envía a un servidor.
const COLUMNAS = ["CLASE", "LOCALIDAD", "FRANJA", "DIA"];
const RUTAS = { onnx: RutaOnnx, json: RutaJson, pyodide: RutaPyodide };
let FICHA = null;

const porcentaje = (p) =>
  (100 * p).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %";

function tarjeta(nombre) {
  const raiz = document.getElementById("ruta-" + nombre);
  return {
    prob: raiz.querySelector(".prob"),
    barra: raiz.querySelector(".barra span"),
    estado: raiz.querySelector(".estado"),
  };
}

function avisar(nombre, texto, esError = false) {
  const t = tarjeta(nombre);
  t.estado.textContent = texto;
  t.estado.classList.toggle("error", esError);
}

async function cargarFicha() {
  const respuesta = await fetch("modelo/ficha_modelo.json");
  FICHA = await respuesta.json();
  // las opciones del formulario salen del propio modelo: nunca se escriben a mano
  for (const columna of COLUMNAS) {
    const select = document.querySelector(`select[name="${columna}"]`);
    for (const valor of FICHA.categorias[columna]) {
      const opcion = document.createElement("option");
      opcion.value = valor;
      opcion.textContent = (FICHA.etiquetas[columna] || {})[valor] || valor;
      select.appendChild(opcion);
    }
  }
  const dl = document.getElementById("ficha");
  for (const [clave, valor] of FICHA.ficha) {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = clave;
    dd.textContent = valor;
    dl.append(dt, dd);
  }
}

function leerFormulario() {
  const datos = new FormData(document.getElementById("formulario"));
  return Object.fromEntries(COLUMNAS.map((c) => [c, datos.get(c)]));
}

async function estimarCon(nombre, entrada) {
  const t = tarjeta(nombre);
  const inicio = performance.now();
  try {
    const p = await RUTAS[nombre].estimar(entrada, (texto) => avisar(nombre, texto));
    const ms = Math.round(performance.now() - inicio);
    t.prob.textContent = porcentaje(p);
    // la barra se escala contra 30 %, por encima de la probabilidad más alta del modelo
    t.barra.style.width = Math.min(100, (100 * p) / 0.3) + "%";
    let texto = `Estimado en ${ms.toLocaleString("es-CO")} ms.`;
    if (nombre === "pyodide" && RutaPyodide.version) texto += " " + RutaPyodide.version + ".";
    avisar(nombre, texto);
    return p;
  } catch (error) {
    t.prob.textContent = "Sin estimar";
    avisar(nombre, "Error: " + error.message, true);
    return null;
  }
}

document.getElementById("formulario").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const entrada = leerFormulario();
  const lectura = document.getElementById("lectura");
  // las dos rutas livianas responden primero; Pyodide sigue cargando en paralelo
  const [pOnnx, pJson] = await Promise.all([estimarCon("onnx", entrada), estimarCon("json", entrada)]);
  const p = pJson ?? pOnnx;
  if (p !== null) {
    const veces = p / FICHA.tasa_base;
    lectura.textContent =
      `Para un reporte así, el modelo estima ${porcentaje(p)} de probabilidad de fallecidos, ` +
      `${veces.toLocaleString("es-CO", { maximumFractionDigits: 1 })} veces la tasa base de ` +
      `${porcentaje(FICHA.tasa_base)} observada en ${FICHA.periodo_prueba}. ` +
      "Es una estimación para priorizar la respuesta, no un diagnóstico del caso.";
  }
  estimarCon("pyodide", entrada);
});

document.getElementById("verificar").addEventListener("click", async () => {
  // compara las tres rutas contra las probabilidades que calculó scikit-learn en Colab
  const caja = document.getElementById("verificacion");
  caja.hidden = false;
  caja.textContent = "Verificando…";
  const prueba = await (await fetch("modelo/casos_prueba.json")).json();
  const filas = [];
  let maxDiferencia = 0;
  for (let i = 0; i < prueba.casos.length; i++) {
    const caso = prueba.casos[i];
    const ref = prueba.probabilidad_colab[i];
    const celdas = [];
    for (const nombre of Object.keys(RUTAS)) {
      let p = null;
      try { p = await RUTAS[nombre].estimar(caso, (texto) => avisar(nombre, texto)); } catch (e) { p = null; }
      if (p === null) { celdas.push("error"); continue; }
      maxDiferencia = Math.max(maxDiferencia, Math.abs(p - ref));
      celdas.push(porcentaje(p));
    }
    filas.push(`<tr><td>${COLUMNAS.map((c) => caso[c]).join(" · ")}</td><td>${porcentaje(ref)}</td><td>${celdas.join("</td><td>")}</td></tr>`);
  }
  const ok = maxDiferencia < 1e-5;
  caja.innerHTML =
    `<div class="tabla-envoltura"><table><thead><tr><th>Caso de prueba</th><th>Colab</th><th>ONNX</th><th>JSON</th><th>Pyodide</th></tr></thead><tbody>${filas.join("")}</tbody></table></div>` +
    `<p class="${ok ? "ok" : "mal"}">Diferencia máxima frente a Colab: ${maxDiferencia.toExponential(1)}. ` +
    (ok ? "Las tres rutas reproducen el modelo entrenado." : "Alguna ruta no reproduce el modelo: revise el preprocesamiento.") + "</p>";
});

cargarFicha().catch((e) => {
  document.getElementById("lectura").textContent = "No se pudo leer modelo/ficha_modelo.json: " + e.message;
});
