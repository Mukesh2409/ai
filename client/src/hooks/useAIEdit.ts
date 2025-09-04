import { useMutation } from "@tanstack/react-query";
import { mistralClient, type AIEditRequest, type AIEditResponse } from "@/lib/mistralClient";
import { useToast } from "@/hooks/use-toast";

export function useAIEdit() {
  const { toast } = useToast();

  const editMutation = useMutation({
    mutationFn: (request: AIEditRequest) => mistralClient.editText(request),
    onError: (error) => {
      toast({
        title: "AI Edit Failed",
        description: error instanceof Error ? error.message : "Failed to process AI edit",
        variant: "destructive",
      });
    },
  });

  const processEdit = async (
    text: string, 
    action: AIEditRequest["action"], 
    customPrompt?: string
  ): Promise<AIEditResponse | null> => {
    try {
      const result = await editMutation.mutateAsync({
        text,
        action,
        customPrompt,
      });
      return result;
    } catch (error) {
      console.error("AI edit error:", error);
      return null;
    }
  };

  return {
    processEdit,
    isLoading: editMutation.isPending,
    error: editMutation.error,
  };
}
