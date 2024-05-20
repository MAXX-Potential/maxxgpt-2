import { LLM } from "@/types"

const ANTHROPIC_PLATORM_LINK =
  "https://docs.anthropic.com/claude/reference/getting-started-with-the-api"

// Anthropic Models (UPDATED 12/21/23) -----------------------------

// Claude 2 (UPDATED 12/21/23)
const CLAUDE_2: LLM = {
  modelId: "claude-2.1",
  modelName: "Claude 2",
  provider: "anthropic",
  hostedId: "claude-2.1",
  platformLink: ANTHROPIC_PLATORM_LINK,
  imageInput: false
}

// Claude Instant (UPDATED 12/21/23)
const CLAUDE_INSTANT: LLM = {
  modelId: "claude-instant-1.2",
  modelName: "Claude Instant",
  provider: "anthropic",
  hostedId: "claude-instant-1.2",
  platformLink: ANTHROPIC_PLATORM_LINK,
  imageInput: false
}

// Claude Opus (UPDATED 5/20/24)
const CLAUDE_OPUS: LLM = {
  modelId: "claude-3-opus-20240229", 
  modelName: "Claude Opus",
  provider: "anthropic",
  hostedId: "claude-3-opus-20240229",
  platformLink: ANTHROPIC_PLATORM_LINK,
  imageInput: true
}

// Claude Sonnet (UPDATED 5/20/24)
const CLAUDE_SONNET: LLM = {
  modelId: "claude-3-sonnet-20240229", 
  modelName: "Claude Sonnet",
  provider: "anthropic",
  hostedId: "claude-3-sonnet-20240229",
  platformLink: ANTHROPIC_PLATORM_LINK,
  imageInput: true
}

// Claude Haiku (UPDATED 5/20/24)
const CLAUDE_HAIKU: LLM = {
  modelId: "claude-3-haiku-20240307", 
  modelName: "Claude Haiku",
  provider: "anthropic",
  hostedId: "claude-3-haiku-20240307",
  platformLink: ANTHROPIC_PLATORM_LINK,
  imageInput: true
}

export const ANTHROPIC_LLM_LIST: LLM[] = [CLAUDE_OPUS, CLAUDE_SONNET, CLAUDE_HAIKU, CLAUDE_2, CLAUDE_INSTANT]
