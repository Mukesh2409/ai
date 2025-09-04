import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Wand2, Check, X, Clock } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  suggestedText: string;
  reasoning: string;
  onConfirm: () => void;
  onCancel: () => void;
  processingTime?: string;
}

export function PreviewModal({
  isOpen,
  onClose,
  originalText,
  suggestedText,
  reasoning,
  onConfirm,
  onCancel,
  processingTime = "1.2s",
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            AI Edit Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Original</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed" data-testid="text-original">
                  {originalText}
                </p>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Wand2 className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">AI Suggestion</h3>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed" data-testid="text-suggested">
                  {suggestedText}
                </p>
              </div>
              
              {/* AI Reasoning */}
              {reasoning && (
                <div className="bg-accent/50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-accent-foreground mb-2 flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-accent-foreground/20" />
                    AI Reasoning
                  </h4>
                  <p className="text-xs text-accent-foreground" data-testid="text-reasoning">
                    {reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <footer className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span data-testid="text-processing-time">Processed in {processingTime}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={onCancel}
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              data-testid="button-confirm"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
