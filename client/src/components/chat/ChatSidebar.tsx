import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  documentId: string;
  onToggle?: () => void;
}

export function ChatSidebar({ documentId, onToggle }: ChatSidebarProps) {
  return (
    <div className="w-80 bg-card border-l border-border flex flex-col" data-testid="chat-sidebar">
      
      {/* Chat Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          {onToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggle}
              data-testid="button-toggle-chat"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <ChatMessages documentId={documentId} />

      {/* Chat Input */}
      <ChatInput documentId={documentId} />
    </div>
  );
}
