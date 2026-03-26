import { z } from "zod";
import { openai } from "./openai.js";
import { config } from "./config.js";
import { tutorSystemPrompt } from "./prompt.js";
import type { CoachReply, FocusFramePayload } from "./types.js";

const coachReplySchema = z.object({
  recognizedText: z.string(),
  inferredTask: z.string(),
  diagnosis: z.string(),
  scaffoldingPrompt: z.string(),
  attentionAdvice: z.string(),
  nextAction: z.string()
});

function buildUserPrompt(payload: FocusFramePayload, sessionSummary?: string) {
  return [
    `mode: ${payload.mode}`,
    `grade_band: ${payload.gradeBand}`,
    `transcript: ${payload.transcript || "none"}`,
    `ocr_text: ${payload.ocrText || "none"}`,
    `attention_score: ${payload.attentionScore ?? "unknown"}`,
    `task_hint: ${payload.taskHint || "none"}`,
    `gaze_point: ${payload.gazePoint ? `${payload.gazePoint.x.toFixed(3)},${payload.gazePoint.y.toFixed(3)}` : "none"}`,
    "recent_session_summary:",
    sessionSummary || "No prior turns."
  ].join("\n");
}

export async function analyzeFocusFrame(
  payload: FocusFramePayload,
  sessionSummary?: string
): Promise<CoachReply> {
  const response = await openai.responses.create({
    model: config.model,
    reasoning: { effort: "high" },
    text: {
      format: {
        type: "json_schema",
        name: "coach_reply",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            recognizedText: { type: "string" },
            inferredTask: { type: "string" },
            diagnosis: { type: "string" },
            scaffoldingPrompt: { type: "string" },
            attentionAdvice: { type: "string" },
            nextAction: { type: "string" }
          },
          required: [
            "recognizedText",
            "inferredTask",
            "diagnosis",
            "scaffoldingPrompt",
            "attentionAdvice",
            "nextAction"
          ]
        }
      }
    },
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: tutorSystemPrompt }]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildUserPrompt(payload, sessionSummary)
          },
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${payload.imageBase64}`,
            detail: "high"
          }
        ]
      }
    ]
  });

  return coachReplySchema.parse(JSON.parse(response.output_text));
}

export async function createRealtimeClientSecret() {
  const response = await fetch(`${config.openAIBaseUrl}/realtime/client_secrets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openAIApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: config.realtimeModel,
        audio: {
          output: {
            voice: "marin"
          }
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to mint realtime token: ${response.status} ${body}`);
  }

  return response.json();
}
