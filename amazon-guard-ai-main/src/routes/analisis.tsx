import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileDown, Fingerprint, ShieldCheck, TrendingUp, Target, MapPin, Trees } from "lucide-react";

export const Route = createFileRoute("/analisis")({
  head: () => ({
    meta: [
      { title: "Análisis Temporal y Reporte · GeoAI Huella Minera" },
      {
        name: "description",
        content:
          "Detección de cambios 2020-2024, precisión del modelo SVM y exportación de reportes firmados con hash SHA-256.",
      },
      { property: "og:title", content: "Análisis Temporal y Reporte Seguro" },
      {
        property: "og:description",
        content: "KPIs de deforestación minera, series temporales y exportación oficial con integridad verificable.",
      },
    ],
  }),
  component: Analisis,
});

const serie = [
  { year: "2020", acumulado: 12400, bosque: 431000, minero: 12400, agua: 1980 },
  { year: "2021", acumulado: 16150, bosque: 427100, minero: 16150, agua: 2240 },
  { year: "2022", acumulado: 20380, bosque: 422700, minero: 20380, agua: 2610 },
  { year: "2023", acumulado: 24620, bosque: 418300, minero: 24620, agua: 2900 },
  { year: "2024", acumulado: 28460, bosque: 412830, minero: 28460, agua: 3190 },
];

const kpis = [
  { label: "Hectáreas deforestadas por minería", value: "28 460 ha", sub: "acumulado 2020–2024", icon: Trees, color: "var(--mining)" },
  { label: "Precisión del modelo SVM", value: "94.2%", sub: "F1-Score 0.91 · Kappa 0.92", icon: Target, color: "var(--forest)" },
  { label: "Frente minero de mayor expansión", value: "Huepetuhe", sub: "+1 420 ha en 2024", icon: MapPin, color: "var(--warn)" },
  { label: "Tasa de crecimiento anual", value: "+15.6%", sub: "vs. 2023", icon: TrendingUp, color: "var(--water)" },
];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

function Analisis() {
  return (
    <div className="mx-auto max-w-[1500px] p-4 lg:p-6">
      <h1 className="text-lg font-semibold">Análisis temporal y reporte seguro</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Detección de cambios de cobertura y exportación fiscalizable.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <p className="max-w-[70%] text-xs text-muted-foreground">{k.label}</p>
              <k.icon className="size-4" style={{ color: k.color }} />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Deforestación acumulada (ha)</h2>
          <p className="text-xs text-muted-foreground">Serie temporal 2020–2024</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  name="Acumulado (ha)"
                  stroke="var(--mining)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--mining)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Cambio de cobertura por año</h2>
          <p className="text-xs text-muted-foreground">Suelo minero vs. agua turbia (ha)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--secondary)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="minero" name="Suelo minero" fill="var(--mining)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="agua" name="Agua turbia" fill="var(--water)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-primary" /> Exportación y seguridad (Tríada CIA)
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <button className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <FileDown className="size-4" /> Generar y descargar reporte oficial PDF
          </button>
          <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3 text-xs">
            <Fingerprint className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Firma digital y <span className="font-mono">hash SHA-256</span> habilitados para validez
              legal y fiscalizadora.
              <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
                9f2b7c1e…a4d0e83b
              </span>
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3 text-xs">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Control de acceso: <strong>Rol Fiscalizador Ambiental</strong>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Permiso de exportación concedido · trazabilidad de auditoría activa
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
