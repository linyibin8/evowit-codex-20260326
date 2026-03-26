import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng+chi_sim");
  }
  return workerPromise;
}

export async function extractTextFromImageBuffer(buffer: Buffer) {
  try {
    const worker = await getWorker();
    const result = await worker.recognize(buffer);
    return result.data.text.trim();
  } catch (error) {
    console.warn("OCR fallback failed", error);
    return "";
  }
}
