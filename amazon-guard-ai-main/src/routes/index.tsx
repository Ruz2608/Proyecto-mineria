import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Cloud, Crosshair, Layers, Locate, Ruler } from "lucide-react";
import { InteractiveMap } from "@/components/InteractiveMap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visor Principal · GeoAI Huella Minera Madre de Dios" },
      {
        name: "description",
        content:
          "Visor satelital Sentinel-2 con clasificación SVM de bosque, suelo minero, agua turbia e infraestructura en Madre de Dios.",
      },
      { property: "og:title", content: "Visor Principal · GeoAI Huella Minera" },
      {
        property: "og:description",
        content:
          "Mapificación y clasificación espectral SVM sobre mosaicos Sentinel-2 de la Amazonía.",
      },
    ],
  }),
  component: Visor,
});

type ClassKey = "forest" | "mining" | "water" | "infra";

const classes: {
  key: ClassKey;
  label: string;
  color: string;
  area: string;
}[] = [
  { key: "forest", label: "🌲 Bosque Primario", color: "var(--forest)", area: "412 830 ha" },
  { key: "mining", label: "🚜 Suelo Minero / Deforestación", color: "var(--mining)", area: "28 460 ha" },
  { key: "water", label: "🌊 Agua Turbia / Poza de Relave", color: "var(--water)", area: "3 190 ha" },
  { key: "infra", label: "🏗️ Infraestructura", color: "var(--infra)", area: "1 245 ha" },
];

function Visor() {
  const [opacity, setOpacity] = useState(75);
  const [cloud, setCloud] = useState(8);
  const [roi, setRoi] = useState("Madre de Dios");
  const [range, setRange] = useState("2023-2024");
  const [visible, setVisible] = useState<Record<ClassKey, boolean>>({
    forest: true,
    mining: true,
    water: true,
    infra: true,
  });

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background">
      {/* 1. Capa interactiva de fondo de borde a borde */}
      <InteractiveMap 
        opacity={opacity / 100} 
        visibleClasses={visible} 
      />

      {/* 2. Capa de interacción y paneles flotantes */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-start">
          {/* Panel izquierdo: Controles de escena */}
          <div className="panel-glass pointer-events-auto w-72 max-w-[85vw] p-4 shadow-xl">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="size-4 text-primary" /> Controles de escena
            </h2>

            <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" /> Rango de fechas
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option>2020-2021</option>
              <option>2021-2022</option>
              <option>2022-2023</option>
              <option>2023-2024</option>
            </select>

            <label className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Cloud className="size-3.5" /> Umbral de nubosidad
              </span>
              <span className="font-mono text-foreground">{cloud}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={20}
              value={cloud}
              onChange={(e) => setCloud(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />

            <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Locate className="size-3.5" /> Región de interés (ROI)
            </label>
            <div className="mt-1.5 grid grid-cols-1 gap-1">
              {["Madre de Dios", "Tambopata", "Huepetuhe"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoi(r)}
                  className={`rounded-md border px-2 py-1.5 text-left text-sm transition-colors ${
                    roi === r
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Opacidad capa SVM</span>
              <span className="font-mono text-foreground">{opacity}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />
          </div>

          {/* Panel derecho: Leyenda de clases SVM */}
          <div className="panel-glass pointer-events-auto w-72 max-w-[85vw] p-4 shadow-xl">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Crosshair className="size-4 text-primary" /> Leyenda de clases SVM
            </h2>
            <ul className="mt-3 space-y-2">
              {classes.map((c) => (
                <li key={c.key}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1.5 hover:bg-secondary/60">
                    <input
                      type="checkbox"
                      checked={visible[c.key]}
                      onChange={() =>
                        setVisible((v) => ({ ...v, [c.key]: !v[c.key] }))
                      }
                      className="size-3.5 accent-[var(--primary)]"
                    />
                    <span
                      className="size-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: c.color }}
                      aria-hidden
                    />
                    <span className="flex-1 text-xs">{c.label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {c.area}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
              Clasificación <span className="font-mono text-primary">ee.Classifier.libsvm</span> ·
              bandas B4/B8/B11/B12 · escala 10 m.
            </p>
          </div>
        </div>

        {/* Barra inferior de estado y metadatos */}
        <div className="panel-glass pointer-events-auto self-start flex flex-wrap items-center gap-4 px-4 py-2 text-[11px] font-mono text-muted-foreground shadow-lg">
          <span className="flex items-center gap-1.5">
            <Ruler className="size-3.5" /> 1:50 000
          </span>
          <span>-12.5933, -70.1234</span>
          <span>EPSG:32719</span>
          <span className="text-primary">
            Nubes ≤ {cloud}% · {roi} · {range}
          </span>
        </div>
      </div>
    </div>
  );
}