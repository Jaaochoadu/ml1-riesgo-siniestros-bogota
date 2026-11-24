// Ruta 2 · Pesos en JSON
// La regresión logística es una fórmula: z = intercepto + suma de los pesos de cada
// categoría elegida, y p = 1 / (1 + e^(-z)). Aquí se reescribe a mano en JavaScript.
const RutaJson = {
  modelo: null,

  async preparar() {
    if (this.modelo) return;
    const respuesta = await fetch("modelo/modelo_pesos.json");
    if (!respuesta.ok) throw new Error("No se encontró modelo/modelo_pesos.json");
    this.modelo = await respuesta.json();
  },

  async estimar(entrada) {
    await this.preparar();
    let z = this.modelo.intercepto;
    for (const columna of COLUMNAS) {
      // una categoría que el modelo no vio en entrenamiento suma 0,
      // igual que OneHotEncoder(handle_unknown="ignore") en Colab
      z += this.modelo.pesos[columna][entrada[columna]] ?? 0;
    }
    return 1 / (1 + Math.exp(-z));
  },
};
