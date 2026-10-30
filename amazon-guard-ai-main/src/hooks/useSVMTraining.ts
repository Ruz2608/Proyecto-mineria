import { useCallback, useRef, useState } from "react";

import { hashSvmConfig } from "@/lib/config-hash";
import { SVM_CLASSES } from "@/types/svm";
import type { SVMConfig, TrainingError, TrainingResult, TrainingStatus } from "@/types/svm";

// Ponlo en false para consumir tu FastAPI levantado en el puerto 8000.
// Si necesitas probar la UI sin el backend activo, cámbialo a true temporalmente.
const USE_MOCK = false;

// Fase 5.3 — Rangos válidos reforzados en cliente (Disponibilidad / Prevenir DoS)
const RANGES = {
  cost: { min: 0.1, max: 1000 },
  gamma: { min: 0.001, max: 10 },
  sampleSizePerClass: { min: 10, max: 2000 },
} as const;

function validateConfig(config: SVMConfig): TrainingError | null {
  if (config.cost < RANGES.cost.min || config.cost > RANGES.cost.max) {
    return {
      code: "INVALID_RANGE",
      message: `El costo (C) debe estar entre ${RANGES.cost.min} y ${RANGES.cost.max}.`,
    };
  }
  if (
    config.kernel === "rbf" &&
    (config.gamma < RANGES.gamma.min || config.gamma > RANGES.gamma.max)
  ) {
    return {
      code: "INVALID_RANGE",
      message: `Gamma (γ) debe estar entre ${RANGES.gamma.min} y ${RANGES.gamma.max} para el kernel RBF.`,
    };
  }
  const { min, max } = RANGES.sampleSizePerClass;
  if (config.sampleSizePerClass < min || config.sampleSizePerClass > max) {
    return {
      code: "INVALID_RANGE",
      message: `El tamaño de muestra por clase debe estar entre ${min} y ${max}.`,
    };
  }
  return null;
}

/**
 * Fase 4.2 — Comunicación real con el backend de Google Earth Engine
 */
async function requestTrainingReal(config: SVMConfig, signal: AbortSignal): Promise<TrainingResult> {
  const res = await fetch("/api/svm/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
    signal,
  });

  if (!res.ok) {
    let errorPayload: TrainingError;
    try {
      errorPayload = (await res.json()) as TrainingError;
    } catch {
      errorPayload = {
        code: "SERVER_ERROR",
        message: `Error del servidor (${res.status}): ${res.statusText}`,
      } as unknown as TrainingError; // <-- El doble casteo evita el error de TypeScript
    }
    throw errorPayload;
  }

  return (await res.json()) as TrainingResult;
}

/**
 * Simulación de contingencia (evita que la pantalla colapse si el backend no responde)
 */
async function requestTrainingMock(config: SVMConfig, signal: AbortSignal): Promise<TrainingResult> {
  const totalSamples = config.sampleSizePerClass * SVM_CLASSES.length;
  const kernelCost = config.kernel === "rbf" ? 900 : 1400;
  const memoryLoad = totalSamples / kernelCost + (config.cost > 500 ? 0.35 : 0);

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 1500);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Entrenamiento cancelado", "AbortError"));
    });
  });

  if (memoryLoad > 1) {
    throw {
      code: "MEMORY_LIMIT",
      message:
        "La consulta satelital excede el límite de memoria del servidor de Earth Engine. Reduce el tamaño de muestra por clase o usa el kernel Lineal.",
    } as TrainingError;
  }

  const n = SVM_CLASSES.length;
  const overallAccuracy = 0.91;
  const matrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const support = Math.max(1, Math.round(config.sampleSizePerClass * 0.25));
      if (i === j) return Math.round(support * overallAccuracy);
      return Math.round((support * (1 - overallAccuracy)) / (n - 1));
    })
  );

  const perClass = SVM_CLASSES.map((c, i) => {
    const row = matrix[i] ?? [];
    const tp = row[i] ?? 0;
    const rowSum = row.reduce((a, b) => a + b, 0);
    const colSum = matrix.reduce((a, r) => a + (r[i] ?? 0), 0);
    const precision = colSum ? tp / colSum : 0;
    const recall = rowSum ? tp / rowSum : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { clase: c.key, precision, recall, f1 };
  });

  return {
    configHash: await hashSvmConfig(config),
    trainedAt: new Date().toISOString(),
    confusionMatrix: { classes: SVM_CLASSES.map((c) => c.key), matrix },
    metrics: {
      overallAccuracy,
      kappa: 0.88,
      perClass,
      convergence: [
        { iteracion: 25, separabilidad: 0.73 },
        { iteracion: 50, separabilidad: 0.84 },
        { iteracion: 75, separabilidad: 0.90 },
        { iteracion: 100, separabilidad: 0.91 },
      ],
    },
  };
}

async function requestTraining(config: SVMConfig, signal: AbortSignal): Promise<TrainingResult> {
  return USE_MOCK ? requestTrainingMock(config, signal) : requestTrainingReal(config, signal);
}

export function useSVMTraining() {
  const [status, setStatus] = useState<TrainingStatus>("idle");
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [error, setError] = useState<TrainingError | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const train = useCallback(async (config: SVMConfig) => {
    setError(null);
    setStatus("validando");

    const validationError = validateConfig(config);
    if (validationError) {
      setStatus("error");
      setError(validationError);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setStatus("entrenando");
      const trainingResult = await requestTraining(config, controller.signal);
      setResult(trainingResult);
      setStatus("listo");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("error");

      if (err && typeof err === "object" && "message" in err) {
        setError(err as TrainingError);
      } else {
        setError({
          code: "UNKNOWN",
          message: "Ocurrió un error al procesar el entrenamiento en Google Earth Engine.",
        } as unknown as TrainingError);
      }
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { status, result, error, train, cancel };
}