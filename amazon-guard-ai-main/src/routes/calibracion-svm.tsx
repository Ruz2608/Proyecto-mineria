import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Cpu,
  Fingerprint,
  Grid3x3,
  Lock,
  Play,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useSVMTraining } from "@/hooks/useSVMTraining";
import { canRetrain, useSessionRole } from "@/lib/rbac";
import { shortHash } from "@/lib/config-hash";
import { SVM_CLASSES } from "@/types/svm";
import type { SvmKernel } from "@/types/svm";

export const Route = createFileRoute("/calibracion-svm")({
  head: () => ({
    meta: [
      { title: "Calibración SVM (avanzada) · GeoAI Huella Minera" },
      {
        name: "description",
        content:
          "Panel de hiperparámetros del clasificador SVM con matriz de confusión, métricas por clase, curvas de separabilidad y sellado de integridad.",
      },
      { property: "og:title", content: "Calibración SVM · Métricas y Seguridad" },
      {
        property: "og:description",
        content:
          "Entrenamiento y validación del modelo con control de acceso por rol y hash de auditoría.",
      },
    ],
  }),
  component: CalibracionSvm,
});

// Fase 2 — límites y escala logarítmica de C y gamma.
const COST_RANGE = { min: 0.1, max: 1000 };
const GAMMA_RANGE = { min: 0.001, max: 10 };
const SAMPLE_OPTIONS = [50, 100, 250, 500, 1000];

const toLogPos = (value: number, range: { min: number; max: number }) => {
  const [lo, hi] = [Math.log10(range.min), Math.log10(range.max)];
  return ((Math.log10(value) - lo) / (hi - lo)) * 100;
};
const fromLogPos = (pos: number, range: { min: number; max: number }) => {
  const [lo, hi] = [Math.log10(range.min), Math.log10(range.max)];
  return Math.pow(10, lo + (pos / 100) * (hi - lo));
};

const fmt = (n: number, digits = 1) => (n < 1 ? n.toFixed(3) : n.toFixed(digits));

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function CalibracionSvm() {
  const [kernel, setKernel] = useState<SvmKernel>("rbf");
  const [cost, setCost] = useState(10);
  const [gamma, setGamma] = useState(0.1);
  const [sampleSize, setSampleSize] = useState(250);
  const [hoverCell, setHoverCell] = useState<{ i: number; j: number } | null>(null);

  const { role, setRole, roles } = useSessionRole(); // Fase 5.1 (mock de sesión)
  const { status, result, error, train, cancel } = useSVMTraining();

  const isBusy = status === "validando" || status === "entrenando";
  const allowed = canRetrain(role);

  const config = useMemo(
    () => ({ kernel, cost, gamma, sampleSizePerClass: sampleSize }),
    [kernel, cost, gamma, sampleSize],
  );

  const handleTrain = () => {
    if (!allowed || isBusy) return;
    train(config);
  };

  const maxCellValue = useMemo(() => {
    if (!result) return 1;
    return Math.max(1, ...result.confusionMatrix.matrix.flat());
  }, [result]);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-[1500px] p-4 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Calibración SVM — panel avanzado</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entrena y valida <span className="font-mono text-primary">ee.Classifier.libsvm</span>{" "}
              con matriz de confusión, métricas por clase y sello de integridad.
            </p>
          </div>

          {/* Fase 5.1 — selector de rol (mock de sesión, solo para demostración) */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
            <Lock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Rol (simulado):</span>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger className="h-7 w-[170px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {/* Fase 2 — Panel de parámetros SVM */}
          <section className="rounded-lg border border-border bg-card p-4 xl:col-span-1">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Cpu className="size-4 text-primary" /> Hiperparámetros
            </h2>

            <p className="mt-4 text-xs text-muted-foreground">Kernel</p>
            <Select value={kernel} onValueChange={(v) => setKernel(v as SvmKernel)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rbf">RBF (por defecto)</SelectItem>
                <SelectItem value="linear">Lineal</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Costo (C) · escala logarítmica</span>
              <span className="font-mono text-foreground">{fmt(cost)}</span>
            </div>
            <Slider
              className="mt-2"
              value={[toLogPos(cost, COST_RANGE)]}
              min={0}
              max={100}
              step={0.5}
              onValueChange={([pos = 0]) => setCost(Number(fromLogPos(pos, COST_RANGE).toFixed(3)))}
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{COST_RANGE.min}</span>
              <span>{COST_RANGE.max}</span>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Gamma (γ) · escala logarítmica</span>
              <span className="font-mono text-foreground">{fmt(gamma)}</span>
            </div>
            <Slider
              className="mt-2"
              value={[toLogPos(gamma, GAMMA_RANGE)]}
              min={0}
              max={100}
              step={0.5}
              disabled={kernel === "linear"}
              onValueChange={([pos = 0]) =>
                setGamma(Number(fromLogPos(pos, GAMMA_RANGE).toFixed(4)))
              }
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{GAMMA_RANGE.min}</span>
              <span>{GAMMA_RANGE.max}</span>
            </div>
            {kernel === "linear" && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Gamma no aplica al kernel Lineal.
              </p>
            )}

            {/* Fase 2.2 — volumen de muestreo, para mitigar desbordes de memoria */}
            <p className="mt-5 text-xs text-muted-foreground">Muestras por clase (Sample Size)</p>
            <Select value={String(sampleSize)} onValueChange={(v) => setSampleSize(Number(v))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} por clase ({s * SVM_CLASSES.length} total)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Volúmenes altos + kernel RBF aumentan el riesgo de exceder la memoria del servidor.
            </p>

            {/* Fase 5.1 — botón deshabilitado si el rol no tiene permiso */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <button
                    onClick={handleTrain}
                    disabled={isBusy || !allowed}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isBusy ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" />
                        {status === "validando"
                          ? "Validando parámetros…"
                          : "Entrenando en Earth Engine…"}
                      </>
                    ) : (
                      <>
                        <Play className="size-4" /> Entrenar y Validar Modelo
                      </>
                    )}
                  </button>
                </span>
              </TooltipTrigger>
              {!allowed && (
                <TooltipContent>
                  Tu rol ({role}) no tiene permiso para reentrenar el modelo.
                </TooltipContent>
              )}
            </Tooltip>

            {isBusy && (
              <>
                <Progress value={status === "validando" ? 20 : 70} className="mt-3" />
                <button
                  onClick={cancel}
                  className="mt-2 w-full text-center text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                >
                  Cancelar
                </button>
              </>
            )}

            <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
              libsvm(kernel: {kernel.toUpperCase()}, cost: {fmt(cost)}, gamma:{" "}
              {kernel === "linear" ? "—" : fmt(gamma)})
            </p>

            {/* Fase 4.3 — manejo de errores */}
            {status === "error" && error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="size-4" />
                <AlertTitle>
                  {error.code === "MEMORY_LIMIT"
                    ? "Límite de memoria excedido"
                    : "No se pudo entrenar"}
                </AlertTitle>
                <AlertDescription className="text-xs">{error.message}</AlertDescription>
              </Alert>
            )}

            {/* Fase 5.2 — sello de integridad del conjunto de hiperparámetros */}
            {result && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-secondary/40 p-3 text-[11px]">
                <Fingerprint className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <div>
                  <p className="text-foreground">Hash de configuración (SHA-256)</p>
                  <p className="mt-0.5 font-mono text-muted-foreground">
                    {shortHash(result.configHash)}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Entrenado {new Date(result.trainedAt).toLocaleString("es-PE")}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Fase 3 — Visualización de métricas y resultados */}
          <section className="rounded-lg border border-border bg-card p-4 xl:col-span-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Resultados de validación
            </h2>

            {!result && !isBusy && (
              <p className="mt-10 text-center text-xs text-muted-foreground">
                Configura los hiperparámetros y ejecuta el entrenamiento para ver la matriz de
                confusión, las métricas y las curvas de separabilidad.
              </p>
            )}
            {isBusy && (
              <p className="mt-10 text-center text-xs text-muted-foreground">
                Procesando muestras espectrales en Earth Engine…
              </p>
            )}

            {result && (
              <Tabs defaultValue="matriz" className="mt-3">
                <TabsList>
                  <TabsTrigger value="matriz">
                    <Grid3x3 className="mr-1.5 size-3.5" /> Matriz de confusión
                  </TabsTrigger>
                  <TabsTrigger value="metricas">
                    <TrendingUp className="mr-1.5 size-3.5" /> Métricas globales
                  </TabsTrigger>
                  <TabsTrigger value="convergencia">Separabilidad</TabsTrigger>
                </TabsList>

                <TabsContent value="matriz" className="mt-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Filas: clase real · Columnas: clase predicha
                  </p>
                  <div className="overflow-auto">
                    <table className="w-full border-separate border-spacing-1 text-center text-xs">
                      <thead>
                        <tr>
                          <th className="p-1" />
                          {SVM_CLASSES.map((c) => (
                            <th key={c.key} className="p-1 font-medium text-muted-foreground">
                              <span
                                className="mx-auto mb-1 block size-2 rounded-full"
                                style={{ backgroundColor: c.color }}
                              />
                              {c.label.split(" ")[0]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.confusionMatrix.matrix.map((row, i) => (
                          <tr key={SVM_CLASSES[i]!.key}>
                            <th className="p-1 text-right font-medium text-muted-foreground">
                              {SVM_CLASSES[i]!.label.split(" ")[0]}
                            </th>
                            {row.map((value, j) => {
                              const isDiagonal = i === j;
                              const intensity = Math.min(1, value / maxCellValue);
                              const isHovered =
                                hoverCell && (hoverCell.i === i || hoverCell.j === j);
                              return (
                                <td
                                  key={j}
                                  onMouseEnter={() => setHoverCell({ i, j })}
                                  onMouseLeave={() => setHoverCell(null)}
                                  className="cursor-default rounded-md p-2 font-mono transition-transform"
                                  style={{
                                    backgroundColor: `color-mix(in oklab, ${
                                      isDiagonal ? "var(--forest)" : "var(--mining)"
                                    } ${10 + intensity * 55}%, transparent)`,
                                    outline: isHovered ? "1px solid var(--primary)" : "none",
                                    transform: isHovered ? "scale(1.04)" : undefined,
                                  }}
                                >
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="metricas" className="mt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border bg-secondary/30 p-3">
                      <p className="text-[11px] text-muted-foreground">
                        Precisión global (Overall Accuracy)
                      </p>
                      <p className="mt-1 font-mono text-2xl font-semibold text-primary">
                        {pct(result.metrics.overallAccuracy)}
                      </p>
                    </div>
                    <div className="rounded-md border border-border bg-secondary/30 p-3">
                      <p className="text-[11px] text-muted-foreground">Coeficiente Kappa</p>
                      <p className="mt-1 font-mono text-2xl font-semibold text-primary">
                        {result.metrics.kappa.toFixed(3)}
                      </p>
                    </div>
                  </div>

                  <table className="mt-4 w-full text-left text-xs">
                    <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="py-2">Clase</th>
                        <th className="text-right">Precisión</th>
                        <th className="text-right">Recall</th>
                        <th className="text-right">F1-Score</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {result.metrics.perClass.map((m) => {
                        const cls = SVM_CLASSES.find((c) => c.key === m.clase)!;
                        return (
                          <tr key={m.clase} className="border-t border-border">
                            <td className="py-2">
                              <span className="flex items-center gap-1.5 font-sans">
                                <span
                                  className="size-2 rounded-full"
                                  style={{ backgroundColor: cls.color }}
                                />
                                {cls.label}
                              </span>
                            </td>
                            <td className="text-right">{pct(m.precision)}</td>
                            <td className="text-right">{pct(m.recall)}</td>
                            <td className="text-right">{pct(m.f1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TabsContent>

                <TabsContent value="convergencia" className="mt-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Separabilidad de bandas espectrales por iteración de entrenamiento
                  </p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={result.metrics.convergence}
                        margin={{ left: -10, right: 8, top: 8 }}
                      >
                        <defs>
                          <linearGradient id="sep" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis dataKey="iteracion" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={11}
                          domain={[0, 1]}
                          tickFormatter={(v) => `${Math.round(v * 100)}%`}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Separabilidad"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="separabilidad"
                          stroke="var(--primary)"
                          fill="url(#sep)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
