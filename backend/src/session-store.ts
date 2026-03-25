import crypto from "node:crypto";
import type { CoachReply, FocusFramePayload, SessionTurn } from "./types.js";

interface SessionState {
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: FocusFramePayload["mode"];
  gradeBand: string;
  turns: SessionTurn[];
}

const sessions = new Map<string, SessionState>();

function summarizeSession(state: SessionState) {
  const recentTurns = state.turns.slice(-3);
  if (recentTurns.length === 0) {
    return "No prior turns.";
  }

  return recentTurns
    .map((turn, index) => {
      const transcript = turn.transcript?.slice(0, 80) || "no transcript";
      const attention = turn.attentionScore?.toFixed(2) || "unknown";
      return `Turn ${index + 1}: attention=${attention}; diagnosis=${turn.diagnosis}; next=${turn.nextAction}; transcript=${transcript}`;
    })
    .join("\n");
}

export function getOrCreateSession(payload: FocusFramePayload) {
  const id = payload.sessionId || crypto.randomUUID();
  const existing = sessions.get(id);
  if (existing) {
    existing.updatedAt = new Date().toISOString();
    existing.mode = payload.mode;
    existing.gradeBand = payload.gradeBand;
    return existing;
  }

  const created: SessionState = {
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: payload.mode,
    gradeBand: payload.gradeBand,
    turns: []
  };
  sessions.set(id, created);
  return created;
}

export function appendTurn(sessionId: string, payload: FocusFramePayload, reply: CoachReply) {
  const state = sessions.get(sessionId);
  if (!state) {
    return;
  }

  state.turns.push({
    at: new Date().toISOString(),
    transcript: payload.transcript,
    attentionScore: payload.attentionScore,
    diagnosis: reply.diagnosis,
    nextAction: reply.nextAction
  });
  state.updatedAt = new Date().toISOString();
}

export function getSessionSummary(sessionId: string) {
  const state = sessions.get(sessionId);
  if (!state) {
    return { summary: "No session state.", turnCount: 0 };
  }

  return {
    summary: summarizeSession(state),
    turnCount: state.turns.length
  };
}
