// Ruta 1 · ONNX
// El archivo modelo.onnx contiene el preprocesamiento (codificación one-hot) y la
// regresión logística: aquí solo se le entregan los textos tal como los elige la persona.
const RutaOnnx = {
  sesion: null,

  async preparar() {
    if (this.sesion) return;
    // los archivos .wasm del motor se toman del mismo CDN y de la misma versión del script
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";
    this.sesion = await ort.InferenceSession.create("modelo/modelo.onnx");
  },

  async estimar(entrada) {
    await this.preparar();
    const feeds = {};
    // una entrada por columna, cada una como tensor de texto de forma [1, 1]
    for (const columna of COLUMNAS) {
      feeds[columna] = new ort.Tensor("string", [entrada[columna]], [1, 1]);
    }
    const salida = await this.sesion.run(feeds);
    // 'probabilities' trae [P(clase 0), P(clase 1)]; interesa la clase 1: con fallecidos
    return Number(salida.probabilities.data[1]);
  },
};
