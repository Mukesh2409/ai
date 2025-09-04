import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { Bot, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@shared/schema";

interface ChatMessagesProps {
  documentId: string;
}

export function ChatMessages({ documentId }: ChatMessagesProps) {
  const { messages, isLoading, isSending } = useChat(documentId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
      
      {/* Welcome Message */}
      <div className="flex gap-3 chat-message">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-sm text-foreground">
              Hello! I'm your AI writing assistant. I can help you edit text, improve content, 
              research topics, and even apply changes directly to your document. What would you like to work on?
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Just now</p>
        </div>
      </div>

      {/* Chat Messages */}
      {messages.map((message: ChatMessage) => (
        <div 
          key={message.id} 
          className={`flex gap-3 chat-message ${message.role === 'user' ? 'justify-end' : ''}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          
          <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
            <div className={`rounded-lg px-3 py-2 ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground inline-block max-w-[85%]' 
                : 'bg-muted text-foreground'
            }`}>
              <p className="text-sm leading-relaxed" data-testid={`message-${message.id}`}>
                {message.content}
              </p>
            </div>
            {message.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-secondary-foreground" />
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isSending && (
        <div className="flex gap-3 chat-message" data-testid="typing-indicator">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="bg-muted rounded-lg px-3 py-2 w-16">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
