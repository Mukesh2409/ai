import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Search, Languages } from "lucide-react";

interface ChatInputProps {
  documentId: string;
}

export function ChatInput({ documentId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const { sendMessage, isSending } = useChat(documentId);

  const handleSubmit = () => {
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (action: string) => {
    const prompts = {
      improve: "Please improve the writing in my document",
      research: "Help me research more information about the topics in my document",
      translate: "Can you help me translate some content?",
    };
    
    const prompt = prompts[action as keyof typeof prompts];
    if (prompt) {
      setInput(prompt);
    }
  };

  return (
    <div className="border-t border-border p-4" data-testid="chat-input-container">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to help with your writing..."
            className="resize-none pr-12"
            rows={2}
            data-testid="input-chat"
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!input.trim() || isSending}
            className="absolute right-2 bottom-2 h-8 w-8 p-0"
            data-testid="button-send-message"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("improve")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          data-testid="button-quick-improve"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Improve writing
        </Button>
        <span className="text-muted-foreground">•</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("research")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          data-testid="button-quick-research"
        >
          <Search className="w-3 h-3 mr-1" />
          Research topic
        </Button>
        <span className="text-muted-foreground">•</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuickAction("translate")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          data-testid="button-quick-translate"
        >
          <Languages className="w-3 h-3 mr-1" />
          Translate
        </Button>
      </div>
    </div>
  );
}
