export type StudyMode = "reading" | "recitation" | "homework" | "writing";

export interface FocusFramePayload {
  sessionId?: string;
  mode: StudyMode;
  gradeBand: string;
  transcript?: string;
  ocrText?: string;
  attentionScore?: number;
  taskHint?: string;
  gazePoint?: {
    x: number;
    y: number;
  };
  imageBase64: string;
}

export interface CoachReply {
  recognizedText: string;
  inferredTask: string;
  diagnosis: string;
  scaffoldingPrompt: string;
  attentionAdvice: string;
  nextAction: string;
}

export interface SessionTurn {
  at: string;
  transcript?: string;
  attentionScore?: number;
  diagnosis: string;
  nextAction: string;
}

export interface AnalyzeFocusResponse extends CoachReply {
  sessionId: string;
  sessionSummary: string;
  turnCount: number;
  ocrText?: string;
}
