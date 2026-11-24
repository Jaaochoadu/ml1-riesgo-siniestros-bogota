// Ruta 3 · Pyodide
// Se carga un intérprete de Python dentro del navegador, se instala scikit-learn
// y se abre el mismo archivo .joblib que se guardó en Colab.
const RutaPyodide = {
  py: null,
  cargando: null,
  version: "",

  async preparar(avisar) {
    if (this.py) return;
    // si dos clics llegan mientras carga, ambos esperan la misma carga
    if (!this.cargando) this.cargando = this._cargar(avisar);
    await this.cargando;
  },

  async _cargar(avisar) {
    avisar("Descargando Python para el navegador…");
    const py = await loadPyodide();
    avisar("Instalando scikit-learn y pandas…");
    await py.loadPackage(["scikit-learn", "pandas"]);
    avisar("Abriendo modelo.joblib…");
    const respuesta = await fetch("modelo/modelo.joblib");
    if (!respuesta.ok) throw new Error("No se encontró modelo/modelo.joblib");
    py.FS.writeFile("/modelo.joblib", new Uint8Array(await respuesta.arrayBuffer()));
    // se registra cualquier advertencia de versiones distintas entre Colab y el navegador
    this.version = py.runPython(`
import warnings, joblib, sklearn
with warnings.catch_warnings(record=True) as _avisos:
    warnings.simplefilter("always")
    modelo = joblib.load("/modelo.joblib")
_texto = f"scikit-learn {sklearn.__version__} en el navegador"
if any("version" in str(a.message).lower() for a in _avisos):
    _texto += " · aviso: el modelo se guardó con otra versión"
_texto
`);
    this.py = py;
  },

  async estimar(entrada, avisar) {
    await this.preparar(avisar);
    this.py.globals.set("entrada", this.py.toPy(entrada));
    return this.py.runPython(`
import pandas as pd
float(modelo.predict_proba(pd.DataFrame([dict(entrada)]))[0, 1])
`);
  },
};
