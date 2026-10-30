import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, Play, RefreshCw, CheckCircle2, AlertTriangle, Database } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useSVMTraining } from "@/hooks/useSVMTraining";

export const Route = createFileRoute("/calibracion")({
  head: () => ({
    meta: [
      { title: "Calibración SVM · GeoAI Huella Minera" },
      {
        name: "description",
        content:
          "Ajuste de kernel, penalización C y gamma del clasificador libsvm, muestras de entrenamiento y monitor de memoria de Earth Engine.",
      },
      { property: "og:title", content: "Calibración SVM · GeoAI Huella Minera" },
      {
        property: "og:description",
        content: "Hiperparámetros, vectores de soporte y prevención de timeouts en Google Earth Engine.",
      },
    ],
  }),
  component: Calibracion,
});

const samples = [
  { id: "S-001", clase: "Bosque", lat: -12.5871, lon: -70.1042, nir: 0.412, swir1: 0.148, swir2: 0.061, ok: true },
  { id: "S-002", clase: "Suelo Minero", lat: -12.7104, lon: -70.2311, nir: 0.298, swir1: 0.386, swir2: 0.341, ok: true },
  { id: "S-003", clase: "Agua", lat: -12.6488, lon: -70.0577, nir: 0.071, swir1: 0.038, swir2: 0.022, ok: true },
  { id: "S-004", clase: "Suelo Minero", lat: -13.0122, lon: -70.4419, nir: 0.311, swir1: 0.402, swir2: 0.358, ok: false },
  { id: "S-005", clase: "Bosque", lat: -12.4409, lon: -69.9938, nir: 0.438, swir1: 0.132, swir2: 0.055, ok: true },
  { id: "S-006", clase: "Agua", lat: -12.8817, lon: -70.3125, nir: 0.089, swir1: 0.047, swir2: 0.029, ok: true },
];

const claseColor: Record<string, string> = {
  Bosque: "var(--forest)",
  "Suelo Minero": "var(--mining)",
  Agua: "var(--water)",
};

function Calibracion() {
  const [kernel, setKernel] = useState<"RBF" | "Lineal" | "Polinomial">("RBF");
  const [c, setC] = useState(10);
  const [gamma, setGamma] = useState(0.01);
  const [sampleSizePerClass, setSampleSizePerClass] = useState(100);
  const [memory, setMemory] = useState(58);

  const { train, status } = useSVMTraining();

  useEffect(() => {
    const t = setInterval(() => {
      setMemory((m) => Math.min(96, Math.max(35, m + (Math.random() * 14 - 7))));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const memState =
    memory > 85
      ? { label: "Riesgo de timeout", color: "var(--mining)" }
      : memory > 70
        ? { label: "Carga elevada", color: "var(--warn)" }
        : { label: "Ejecución segura", color: "var(--forest)" };

  const handleRetrain = () => {
    const kernelType = kernel === "Lineal" ? "linear" : "rbf";
    train({
      kernel: kernelType,
      cost: c,
      gamma: gamma,
      sampleSizePerClass: sampleSizePerClass,
    });
  };

  const isTraining = status === "entrenando" || status === "validando";

  return (
    <div className="mx-auto max-w-[1500px] p-4 lg:p-6">
      <h1 className="text-lg font-semibold">Calibración del clasificador SVM</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajusta los hiperparámetros de <span className="font-mono text-primary">ee.Classifier.libsvm</span> y
        valida las muestras de entrenamiento.
      </p>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {/* Hiperparámetros */}
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Cpu className="size-4 text-primary" /> Hiperparámetros
          </h2>

          <p className="mt-4 text-xs text-muted-foreground">Kernel</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(["RBF", "Lineal", "Polinomial"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKernel(k)}
                className={`rounded-md border px-2 py-2 text-xs transition-colors ${
                  kernel === k
                    ? "border-primary bg-primary/15"
                    : "border-border bg-secondary text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Penalización de error (C)</span>
            <span className="font-mono text-foreground">{c.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={100}
            step={0.1}
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)]"
          />

          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Coeficiente Gamma (γ)</span>
            <span className="font-mono text-foreground">{gamma.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={1}
            step={0.001}
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)]"
            disabled={kernel === "Lineal"}
          />

          <button
            onClick={handleRetrain}
            disabled={isTraining}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isTraining ? (
              <>
                <RefreshCw className="size-4 animate-spin" /> Entrenando en Earth Engine…
              </>
            ) : (
              <>
                <Play className="size-4" /> Re-entrenar modelo ee.Classifier.libsvm
              </>
            )}
          </button>
          <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
            libsvm(kernel: {kernel.toUpperCase()}, cost: {c.toFixed(1)}, gamma: {gamma.toFixed(3)})
          </p>
        </section>

        {/* Monitor de memoria */}
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Monitor de memoria del servidor</h2>
          <p className="text-xs text-muted-foreground">Capacidad computacional de Google Earth Engine</p>

          <div className="mt-6 flex flex-col items-center">
            <div className="relative size-40">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--secondary)" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={memState.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(memory / 100) * 326.7} 326.7`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-semibold">{Math.round(memory)}%</span>
                <span className="text-[11px] text-muted-foreground">uso de memoria</span>
              </div>
            </div>
            <div
              className="mt-4 flex items-center gap-2 rounded-full px-3 py-1 text-xs"
              style={{ backgroundColor: `color-mix(in oklab, ${memState.color} 18%, transparent)`, color: memState.color }}
            >
              {memory > 85 ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
              {memState.label}
            </div>
          </div>

          <dl className="mt-6 space-y-2 text-xs">
            {[
              ["Tiles en cola", "128"],
              ["Escala de procesamiento", "10 m/px"],
              ["Tiempo estimado", "42 s"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Muestras */}
        <section className="rounded-lg border border-border bg-card p-4 xl:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Database className="size-4 text-primary" /> Vectores de soporte y muestras
            </h2>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-primary font-medium">
              {sampleSizePerClass} pts / clase
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Puntos etiquetados a mano · {sampleSizePerClass * 4} en total
            </p>
          </div>

          {/* Slider interactivo para ajustar el tamaño de muestra de entrenamiento */}
          <div className="my-3 space-y-1.5 rounded-md border border-border/60 bg-muted/20 p-2.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Muestreo por clase (Control de cuota GEE)</span>
              <span className="font-mono">{sampleSizePerClass} pts</span>
            </div>
            <Slider
              min={10}
              max={2000}
              step={10}
              value={[sampleSizePerClass]}
              onValueChange={([val]) => setSampleSizePerClass(val ?? 100)}
            />
          </div>

          <div className="mt-2 max-h-[360px] overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-card text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2">Clase</th>
                  <th>Coordenadas</th>
                  <th className="text-right">NIR</th>
                  <th className="text-right">SWIR1</th>
                  <th className="text-right">SWIR2</th>
                  <th className="text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {samples.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="py-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: claseColor[s.clase] }}
                        />
                        {s.clase}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {s.lat.toFixed(3)}, {s.lon.toFixed(3)}
                    </td>
                    <td className="text-right">{s.nir.toFixed(3)}</td>
                    <td className="text-right">{s.swir1.toFixed(3)}</td>
                    <td className="text-right">{s.swir2.toFixed(3)}</td>
                    <td className="text-right">
                      <span style={{ color: s.ok ? "var(--forest)" : "var(--warn)" }}>
                        {s.ok ? "Validado" : "Revisar"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}