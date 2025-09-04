import { apiRequest } from "./queryClient";

export interface AIEditRequest {
  text: string;
  action: "shorten" | "expand" | "grammar" | "table" | "custom";
  customPrompt?: string;
}

export interface AIEditResponse {
  originalText: string;
  suggestedText: string;
  reasoning: string;
  action: string;
}

export interface ChatRequest {
  documentId: string;
  content: string;
  role: "user" | "assistant";
  metadata?: any;
}

export interface SearchRequest {
  query: string;
  maxResults?: number;
}

export const mistralClient = {
  async editText(request: AIEditRequest): Promise<AIEditResponse> {
    const response = await apiRequest("POST", "/api/ai-edit", request);
    return await response.json();
  },

  async sendChatMessage(request: ChatRequest) {
    const response = await apiRequest("POST", "/api/chat", request);
    return await response.json();
  },

  async searchWeb(request: SearchRequest) {
    const response = await apiRequest("POST", "/api/search", request);
    return await response.json();
  },
};
