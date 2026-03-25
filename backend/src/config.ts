import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8787),
  openAIApiKey: process.env.OPENAI_API_KEY || "",
  openAIBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  model: process.env.MODEL || "gpt-5.4",
  realtimeModel: process.env.REALTIME_MODEL || "gpt-realtime",
  allowedOrigin: process.env.ALLOWED_ORIGIN || "*"
};

if (!config.openAIApiKey) {
  console.warn("OPENAI_API_KEY is not set. API calls will fail until configured.");
}

