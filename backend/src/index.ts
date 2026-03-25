import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { config } from "./config.js";
import { analyzeFocusFrame, createRealtimeClientSecret } from "./coach.js";
import { appendTurn, getOrCreateSession, getSessionSummary } from "./session-store.js";
import type { AnalyzeFocusResponse, FocusFramePayload } from "./types.js";

const app = express();
app.use(cors({ origin: config.allowedOrigin }));
app.use(express.json({ limit: "20mb" }));

const focusFrameSchema = z.object({
  sessionId: z.string().uuid().optional(),
  mode: z.enum(["reading", "recitation", "homework", "writing"]),
  gradeBand: z.string().min(1),
  transcript: z.string().optional(),
  attentionScore: z.number().min(0).max(1).optional(),
  taskHint: z.string().optional(),
  gazePoint: z
    .object({
      x: z.number(),
      y: z.number()
    })
    .optional(),
  imageBase64: z.string().min(32)
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, model: config.model, realtimeModel: config.realtimeModel });
});

app.post("/api/analyze/focus", async (req, res) => {
  try {
    const payload = focusFrameSchema.parse(req.body) as FocusFramePayload;
    const session = getOrCreateSession(payload);
    const prior = getSessionSummary(session.id);
    const result = await analyzeFocusFrame({ ...payload, sessionId: session.id }, prior.summary);
    appendTurn(session.id, payload, result);
    const summary = getSessionSummary(session.id);
    const response: AnalyzeFocusResponse = {
      ...result,
      sessionId: session.id,
      sessionSummary: summary.summary,
      turnCount: summary.turnCount
    };
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/realtime/token", async (_req, res) => {
  try {
    const token = await createRealtimeClientSecret();
    res.json(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`EvoWit backend listening on ${config.port}`);
});

const wss = new WebSocketServer({ server, path: "/ws/coach" });

const wsMessageSchema = z.object({
  type: z.enum(["focus_frame"]),
  payload: focusFrameSchema
});

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "ready" }));

  socket.on("message", async (raw) => {
    try {
      const message = wsMessageSchema.parse(JSON.parse(raw.toString()));
      if (message.type === "focus_frame") {
        const session = getOrCreateSession(message.payload);
        const prior = getSessionSummary(session.id);
        const result = await analyzeFocusFrame(
          { ...message.payload, sessionId: session.id },
          prior.summary
        );
        appendTurn(session.id, message.payload, result);
        const summary = getSessionSummary(session.id);
        socket.send(
          JSON.stringify({
            type: "coach_reply",
            payload: {
              ...result,
              sessionId: session.id,
              sessionSummary: summary.summary,
              turnCount: summary.turnCount
            }
          })
        );
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error"
        })
      );
    }
  });
});
