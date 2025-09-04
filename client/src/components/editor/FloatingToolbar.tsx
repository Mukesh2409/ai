import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Combine, Expand, Table, CheckSquare, Wand2 } from "lucide-react";
import { useAIEdit } from "@/hooks/useAIEdit";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number } | null;
  selectedText: string;
  onEditComplete: (originalText: string, suggestedText: string, reasoning: string) => void;
  onCustomEdit: () => void;
}

export function FloatingToolbar({ 
  isVisible, 
  position, 
  selectedText, 
  onEditComplete, 
  onCustomEdit 
}: FloatingToolbarProps) {
  const { processEdit, isLoading } = useAIEdit();

  const handleEdit = async (action: "shorten" | "expand" | "grammar" | "table") => {
    if (!selectedText) return;
    
    const result = await processEdit(selectedText, action);
    if (result) {
      onEditComplete(result.originalText, result.suggestedText, result.reasoning);
    }
  };

  if (!isVisible || !position) return null;

  return (
    <div
      className={cn(
        "floating-toolbar bg-popover border border-border rounded-lg shadow-lg p-2 flex items-center gap-2",
        isVisible ? "active" : ""
      )}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y - 50}px`,
        zIndex: 50,
      }}
      data-testid="floating-toolbar"
    >
      <Button
        size="sm"
        variant="default"
        onClick={() => handleEdit("shorten")}
        disabled={isLoading}
        data-testid="button-shorten"
        className="text-xs flex items-center gap-1"
      >
        <Combine className="w-3 h-3" />
        Shorten
      </Button>
      
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleEdit("expand")}
        disabled={isLoading}
        data-testid="button-expand"
        className="text-xs flex items-center gap-1"
      >
        <Expand className="w-3 h-3" />
        Expand
      </Button>
      
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleEdit("table")}
        disabled={isLoading}
        data-testid="button-table"
        className="text-xs flex items-center gap-1"
      >
        <Table className="w-3 h-3" />
        Table
      </Button>
      
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleEdit("grammar")}
        disabled={isLoading}
        data-testid="button-grammar"
        className="text-xs flex items-center gap-1"
      >
        <CheckSquare className="w-3 h-3" />
        Grammar
      </Button>
      
      <div className="w-px h-6 bg-border" />
      
      <Button
        size="sm"
        variant="outline"
        onClick={onCustomEdit}
        disabled={isLoading}
        data-testid="button-custom-edit"
        className="text-xs flex items-center gap-1"
      >
        <Wand2 className="w-3 h-3" />
        Custom Edit
      </Button>
    </div>
  );
}
