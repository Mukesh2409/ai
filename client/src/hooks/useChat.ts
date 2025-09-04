import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mistralClient } from "@/lib/mistralClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";

export function useChat(documentId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/documents", documentId, "messages"],
    enabled: !!documentId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      mistralClient.sendChatMessage({
        documentId,
        content,
        role: "user",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/documents", documentId, "messages"],
      });
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessageMutation.mutate(content);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
}
