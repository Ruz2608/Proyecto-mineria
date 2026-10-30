// Fase 4.1 — Tipos TypeScript para hiperparámetros y respuesta del clasificador SVM.

export type SvmKernel = "rbf" | "linear";

export interface SVMConfig {
  kernel: SvmKernel;
  cost: number; // C — penalización de error, escala logarítmica 0.1–1000
  gamma: number; // γ — solo aplica a kernel RBF, escala logarítmica 0.001–10
  sampleSizePerClass: number; // muestras por clase usadas en el entrenamiento
}

// Paleta semántica estandarizada en la Capa 1 (Fase 3.2).
export const SVM_CLASSES = [
  { key: "bosque", label: "Bosque Primario", color: "var(--forest)" },
  { key: "minero", label: "Suelo Minero / Deforestación", color: "var(--mining)" },
  { key: "relave", label: "Poza de Relave / Agua turbia", color: "var(--water)" },
  { key: "infraestructura", label: "Infraestructura", color: "var(--infra)" },
] as const;

export type SvmClassKey = (typeof SVM_CLASSES)[number]["key"];

export interface ConfusionMatrix {
  classes: SvmClassKey[];
  matrix: number[][]; // filas: clase real, columnas: clase predicha
}

export interface ClassMetric {
  clase: SvmClassKey;
  precision: number;
  recall: number;
  f1: number;
}

export interface ConvergencePoint {
  iteracion: number;
  separabilidad: number;
}

export interface ValidationMetrics {
  overallAccuracy: number;
  kappa: number;
  perClass: ClassMetric[];
  convergence: ConvergencePoint[];
}

export interface TrainingResult {
  configHash: string; // Fase 5.2 — sello de integridad del conjunto de hiperparámetros
  trainedAt: string;
  confusionMatrix: ConfusionMatrix;
  metrics: ValidationMetrics;
}

export type TrainingStatus = "idle" | "validando" | "entrenando" | "listo" | "error";

export interface TrainingError {
  code: "MEMORY_LIMIT" | "INVALID_RANGE" | "FORBIDDEN" | "UNKNOWN";
  message: string;
}
