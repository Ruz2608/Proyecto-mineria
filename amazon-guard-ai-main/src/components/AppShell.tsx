import { Link } from "@tanstack/react-router";
import {
  Satellite,
  Map as MapIcon,
  SlidersHorizontal,
  BarChart3,
  ShieldCheck,
  CircleDot,
  Menu,
  X,
  FlaskConical,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Visor Principal", icon: MapIcon, desc: "Mapificación SVM" },
  {
    to: "/calibracion",
    label: "Calibración SVM",
    icon: SlidersHorizontal,
    desc: "Hiperparámetros",
  },
  {
    to: "/calibracion-svm",
    label: "Calibración SVM (avanzada)",
    icon: FlaskConical,
    desc: "Matriz, métricas y hash",
  },
  { to: "/analisis", label: "Análisis Temporal", icon: BarChart3, desc: "Reporte seguro" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-sidebar/90 px-4 backdrop-blur">
        <button
          className="rounded-md border border-border p-1.5 text-muted-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir navegación"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
        <div className="flex items-center gap-2">
          <Satellite className="size-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">
            GeoAI <span className="text-muted-foreground">/ Huella Minera Amazonía</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs sm:flex">
            <CircleDot className="size-3 animate-pulse text-primary" />
            Google Earth Engine · conectado
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground md:flex">
            <ShieldCheck className="size-3 text-primary" /> Rol: Fiscalizador Ambiental
          </span>
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            RD
          </div>
        </div>
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-14 z-30 w-64 border-r border-sidebar-border bg-sidebar p-3 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Módulos
        </p>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground border-primary/60 shadow-[inset_2px_0_0_0_var(--primary)]",
              }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-sidebar-accent/60" }}
              className="flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm transition-colors"
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="font-medium">{item.label}</span>
                <span className="text-[11px] text-muted-foreground">{item.desc}</span>
              </span>
            </Link>
          ))}
        </nav>

        <div className="absolute inset-x-3 bottom-3 rounded-md border border-sidebar-border bg-card/60 p-3 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground">Sentinel-2 L2A</p>
          <p>Mosaico 2023–2024 · 10 m/px</p>
          <p className="mt-1 font-mono text-primary">SVM · libsvm · RBF</p>
        </div>
      </aside>

      <main className="pl-0 pt-14 lg:pl-64">{children}</main>
    </div>
  );
}
