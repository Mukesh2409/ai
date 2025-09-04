import { Wand2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "AI is processing your request..." 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="bg-card border border-border rounded-lg shadow-xl px-8 py-6 flex items-center gap-4">
        <div className="animate-spin">
          <Wand2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground" data-testid="text-loading-message">
            {message}
          </p>
          <p className="text-sm text-muted-foreground">
            This usually takes a few seconds
          </p>
        </div>
      </div>
    </div>
  );
}
