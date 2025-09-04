import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Update document content
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        content: z.any(),
        title: z.string().optional(),
      });
      
      const parsed = updateSchema.parse(req.body);
      
      const updatedDoc = await storage.updateDocument(req.params.id, {
        content: parsed.content,
        title: parsed.title,
      });
      
      if (!updatedDoc) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(updatedDoc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Get chat messages
  app.get("/api/documents/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send chat message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const parsed = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      const userMessage = await storage.createChatMessage(parsed);
      
      // Get AI response from Mistral
      const mistralApiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY || "";
      if (!mistralApiKey) {
        return res.status(500).json({ message: "Mistral API key not configured" });
      }

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content: "You are a helpful writing assistant. You can help users improve their writing, answer questions about content, and suggest edits. When users ask for specific edits, provide clear suggestions that can be applied to their text."
            },
            {
              role: "user",
              content: parsed.content
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const aiContent = aiResponse.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at the moment.";

      // Store AI response
      const aiMessage = await storage.createChatMessage({
        documentId: parsed.documentId,
        content: aiContent,
        role: "assistant",
        metadata: null,
      });

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // AI text editing endpoint
  app.post("/api/ai-edit", async (req, res) => {
    try {
      const editSchema = z.object({
        text: z.string(),
        action: z.enum(["shorten", "expand", "grammar", "table", "custom"]),
        customPrompt: z.string().optional(),
      });

      const parsed = editSchema.parse(req.body);

      const mistralApiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY || "";
      if (!mistralApiKey) {
        return res.status(500).json({ message: "Mistral API key not configured" });
      }

      let prompt = "";
      switch (parsed.action) {
        case "shorten":
          prompt = `Make this text more concise while preserving the key meaning: "${parsed.text}"`;
          break;
        case "expand":
          prompt = `Expand this text with more detail and context: "${parsed.text}"`;
          break;
        case "grammar":
          prompt = `Fix any grammar, spelling, or style issues in this text: "${parsed.text}"`;
          break;
        case "table":
          prompt = `Convert this text into a properly formatted table structure: "${parsed.text}"`;
          break;
        case "custom":
          prompt = `${parsed.customPrompt || "Improve this text"}: "${parsed.text}"`;
          break;
      }

      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content: "You are a professional text editor. Provide only the edited text as your response, without additional commentary unless specifically requested. Focus on making clear, concise improvements."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const suggestedText = aiResponse.choices[0]?.message?.content || "Could not generate suggestion.";

      // Generate reasoning
      const reasoningResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralApiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content: "Briefly explain in 1-2 sentences why you made the specific changes to improve the text."
            },
            {
              role: "user",
              content: `Original: "${parsed.text}"\nEdited: "${suggestedText}"\nWhat changes did you make and why?`
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      let reasoning = "AI processing completed.";
      if (reasoningResponse.ok) {
        const reasoningData = await reasoningResponse.json();
        reasoning = reasoningData.choices[0]?.message?.content || reasoning;
      }

      res.json({
        originalText: parsed.text,
        suggestedText,
        reasoning,
        action: parsed.action,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error in AI edit:", error);
      res.status(500).json({ message: "Failed to process AI edit request" });
    }
  });

  // Web search endpoint (bonus feature)
  app.post("/api/search", async (req, res) => {
    try {
      const searchSchema = z.object({
        query: z.string(),
        maxResults: z.number().optional().default(5),
      });

      const parsed = searchSchema.parse(req.body);

      // Using DuckDuckGo Instant Answer API
      const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(parsed.query)}&format=json&no_html=1&skip_disambig=1`);
      
      if (!searchResponse.ok) {
        throw new Error("Search API error");
      }

      const searchData = await searchResponse.json();
      
      res.json({
        query: parsed.query,
        results: searchData.RelatedTopics?.slice(0, parsed.maxResults) || [],
        abstract: searchData.Abstract || "",
      });
    } catch (error) {
      console.error("Error in search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
