import { LLM } from "@/types"

const OPENAI_PLATORM_LINK = "https://platform.openai.com/docs/overview"

// OpenAI Models (UPDATED 5/19/24) -----------------------------

// GPT-4 Turbo (UPDATED 12/18/23)
const GPT4Turbo: LLM = {
  modelId: "gpt-4-1106-preview",
  modelName: "GPT-4 Turbo",
  provider: "openai",
  hostedId: "gpt-4-1106-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

// GPT-4 Turbo Preview (UPDATED 5/19/24)
const GPT4TurboPreview: LLM = {
  modelId: "gpt-4-turbo-preview",
  modelName: "GPT-4 Turbo Preview",
  provider: "openai",
  hostedId: "gpt-4-turbo-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

// GPT-4 Turbo Combined(UPDATED 5/19/24)
const GPT4TurboCombined: LLM = {
  modelId: "gpt-4-turbo",
  modelName: "GPT-4 Turbo Combined",
  provider: "openai",
  hostedId: "gpt-4-turbo",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true
}

// GPT-4 Omni (UPDATED 5/19/24)
const GPT4Omni: LLM = {
  modelId: "gpt-4o",
  modelName: "GPT-4 Omni",
  provider: "openai",
  hostedId: "gpt-4o",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true
}

// GPT-4 Vision (UPDATED 12/18/23)
const GPT4Vision: LLM = {
  modelId: "gpt-4-vision-preview",
  modelName: "GPT-4 Vision",
  provider: "openai",
  hostedId: "gpt-4-vision-preview",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true
}

// GPT-3.5 Turbo (UPDATED 12/18/23)
const GPT3_5Turbo: LLM = {
  modelId: "gpt-3.5-turbo-1106",
  modelName: "GPT-3.5 Turbo",
  provider: "openai",
  hostedId: "gpt-3.5-turbo-1106",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

// GPT-3.5 Turbo (UPDATED 5/19/24)
const GPT3_5TurboPreview: LLM = {
  modelId: "gpt-3.5-turbo",
  modelName: "GPT-3.5 Turbo Preview",
  provider: "openai",
  hostedId: "gpt-3.5-turbo",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false
}

export const OPENAI_LLM_LIST: LLM[] = [GPT4Omni, GPT4TurboPreview, GPT4TurboCombined, GPT4Turbo, GPT4Vision, GPT3_5Turbo, GPT3_5TurboPreview]
