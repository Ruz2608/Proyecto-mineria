# Amazon Geo Eye

Crea una aplicación web moderna tipo Dashboard de GeoAI para el Monitoreo y Mapeo de la Huella Minera en la Amazonía (Madre de Dios) utilizando datos satelitales Sentinel-2 y un modelo de clasificación Support Vector Machine (SVM).

### 🎨 Estilo Visual y Tema (UX/UI)
- **Tema**: Dark Mode profesional estilo GIS/Plataforma Satelital (colores de fondo Slate/Zinc 900/950, acentos verde esmeralda para bosque, rojo/ámbar para suelo minero, cian para cuerpos de agua y violeta para infraestructura).
- **Librerías sugeridas**: Tailwind CSS, Lucide React Icons, Recharts (para gráficos), componentes estilo Shadcn UI.
- **Estructura general**: Sidebar lateral izquierdo con navegación por 3 vistas/pantallas principales, Header superior con estado de conexión a Google Earth Engine y usuario, y área central de contenido dinámico.

---

### 🖥️ PANTALLA 1: "Visor Principal" (Mapificación y Clasificación Espectral)
1. **Mapa Interactivo Central**:
   - Simula un visor de mapas satelitales (estilo Leaflet/Mapbox) enfocado en la Amazonía.
   - Superposición de capas con controles de opacidad:
     - Capa Base: Mosaico Satelital Sentinel-2 (Color Verdadero).
     - Capa Clasificada SVM: Máscara binaria/multiclase destacando en colores visibles:
       - 🌲 Bosque Primario (Verde)
       - 🚜 Suelo Minero / Deforestación (Rojo deslumbrante)
       - 🌊 Agua Turbia / Poza de Relave (Azul/Cian)
       - 🏗️ Infraestructura (Gris/Violeta)
2. **Panel de Controles Flotante (Izquierda)**:
   - Filtro de Rango de Fechas (ej. Mosaico 2023 - 2024).
   - Umbral de Filtro de Nubosidad (Slider de 0% a 20%).
   - Selector de Región de Interés (ROI): Madre de Dios, Tambopata, Huepetuhe.
3. **Leyenda Dinámica (Derecha)**:
   - Cuadro explicativo con los códigos de color de las clases y checkbox para encender/apagar cada capa.

---

### 🎛️ PANTALLA 2: "Calibración SVM" (Gestión de Modelo e Hiperparámetros)
1. **Panel de Hiperparámetros SVM**:
   - Control para elegir Kernel: RBF (Radial Basis Function - por defecto), Lineal, Polinomial.
   - Slider para Penalización de Error ($C$): Rango 0.1 a 100 (valor por defecto: 10.0).
   - Slider para Coeficiente Gamma ($\gamma$): Rango 0.001 a 1.0 (valor por defecto: 0.01).
   - Botón de acción: "Re-entrenar Modelo `ee.Classifier.libsvm`".
2. **Gestor de Vectores de Soporte y Puntos de Muestra**:
   - Tabla con muestras de entrenamiento etiquetadas a mano (Bosque, Suelo Minero, Agua).
   - Muestra de coordenadas, banda espectral (NIR, SWIR1, SWIR2) y estado de validación.
3. **Monitor de Memoria del Servidor (Prevención de Timeouts)**:
   - Indicador radial / Barra de progreso en tiempo real de la capacidad computacional de Google Earth Engine: "Uso de memoria: 58% - Ejecución Segura". Alerta en amarillo/rojo si supera el 85%.

---

### 📊 PANTALLA 3: "Análisis Temporal y Reporte Seguro" (Detección de Cambios y Exportación)
1. **Tarjetas de Métricas Rápidas (KPIs Top)**:
   - Total Hectáreas Deforestadas por Minería.
   - Precisión del Modelo SVM (Overall Accuracy: 94.2% / F1-Score: 0.91).
   - Frente Minero Activo de Mayor Expansión.
   - Tasa de Crecimiento Anual (%).
2. **Gráficos Estadísticos (Recharts)**:
   - **Gráfico de Línea Temporal**: Evolución de la deforestación acumulada (2020 - 2024) en hectáreas.
   - **Gráfico de Barras**: Comparativa de cambio de cobertura de suelo por año.
3. **Módulo de Exportación y Seguridad (Tríada CIA)**:
   - Botón principal: "Generar y Descargar Reporte Oficial PDF".
   - Badge de Seguridad e Integridad: "Firma Digital y Hash SHA-256 habilitado para validez legal/fiscalizadora".
   - Control de Acceso: Indicador de nivel de usuario (ej. "Rol: Fiscalizador Ambiental - Permiso de Exportación").

---

Construye la interfaz responsiva, limpia, moderna e interactiva para poder alternar entre las 3 pestañas desde el Sidebar.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ee316ec-cfeb-4e8f-99cb-d13ead6fd098).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
