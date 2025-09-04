import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { TipTapEditor, type TipTapEditorRef } from "@/components/editor/TipTapEditor";
import { FloatingToolbar } from "@/components/editor/FloatingToolbar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { PreviewModal } from "@/components/editor/PreviewModal";
import { LoadingOverlay } from "@/components/editor/LoadingOverlay";
import { useTextSelection } from "@/hooks/useTextSelection";
import { useAIEdit } from "@/hooks/useAIEdit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Share, Settings, Bold, Italic, Underline, Heading, List, Table as TableIcon, Wand2, Combine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

export default function EditorPage() {
  const [previewData, setPreviewData] = useState<{
    originalText: string;
    suggestedText: string;
    reasoning: string;
    selectedText?: string;
  } | null>(null);
  
  const [customEditPrompt, setCustomEditPrompt] = useState("");
  const [isCustomEditOpen, setIsCustomEditOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  
  const editorRef = useRef<TipTapEditorRef>(null);
  const { selection } = useTextSelection();
  const { processEdit, isLoading } = useAIEdit();
  const { toast } = useToast();

  // Use default document for demo
  const { data: document } = useQuery({
    queryKey: ["/api/documents", "default-doc-id"]
  }) as { data: Document | undefined };

  const handleEditComplete = (originalText: string, suggestedText: string, reasoning: string) => {
    setPreviewData({
      originalText,
      suggestedText,
      reasoning,
      selectedText: selection.text,
    });
  };

  const handleConfirmEdit = () => {
    if (previewData && editorRef.current) {
      // Apply the suggested text by replacing the currently selected text
      editorRef.current.replaceSelectedText(previewData.suggestedText);
      toast({
        title: "Changes Applied",
        description: "AI suggestions have been applied to your document",
      });
    }
    setPreviewData(null);
  };

  const handleCustomEdit = () => {
    setIsCustomEditOpen(true);
  };

  const handleCustomEditSubmit = async () => {
    if (!selection.text || !customEditPrompt) return;
    
    const result = await processEdit(selection.text, "custom", customEditPrompt);
    if (result) {
      handleEditComplete(result.originalText, result.suggestedText, result.reasoning);
    }
    setIsCustomEditOpen(false);
    setCustomEditPrompt("");
  };

  if (!document) {
    return <LoadingOverlay isVisible={true} message="Loading document..." />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Editor Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                  <Edit className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">AI Collaborative Editor</h1>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <span className="text-sm text-muted-foreground" data-testid="text-document-title">
                {document.title}
              </span>
              <div className="w-2 h-2 rounded-full bg-amber-500" title="Auto-saving..."></div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                size="sm"
                data-testid="button-share"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Editor Toolbar */}
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 mr-4">
              <Button variant="ghost" size="sm" data-testid="button-bold">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-italic">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-underline">
                <Underline className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-2"></div>
              <Button variant="ghost" size="sm" data-testid="button-heading">
                <Heading className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-list">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-table">
                <TableIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-px h-6 bg-border mx-2"></div>
              <Button size="sm" data-testid="button-ai-assist">
                <Wand2 className="w-4 h-4 mr-2" />
                Ask AI
              </Button>
              <Button variant="secondary" size="sm" data-testid="button-ai-summarize">
                <Combine className="w-4 h-4 mr-2" />
                Summarize
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 relative bg-background">
          <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <TipTapEditor
                ref={editorRef}
                document={document}
                onSelectionUpdate={(sel) => {
                  // Handle selection updates if needed
                }}
              />
            </div>
          </div>

          {/* Floating Toolbar */}
          <FloatingToolbar
            isVisible={selection.isActive}
            position={selection.rect ? {
              x: selection.rect.left + selection.rect.width / 2,
              y: selection.rect.top
            } : null}
            selectedText={selection.text}
            onEditComplete={handleEditComplete}
            onCustomEdit={handleCustomEdit}
          />
        </div>
      </div>

      {/* Resize Handle */}
      <div className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-ew-resize" />

      {/* Chat Sidebar */}
      <ChatSidebar documentId={document.id} />

      {/* Preview Modal */}
      {previewData && (
        <PreviewModal
          isOpen={!!previewData}
          onClose={() => setPreviewData(null)}
          originalText={previewData.originalText}
          suggestedText={previewData.suggestedText}
          reasoning={previewData.reasoning}
          onConfirm={handleConfirmEdit}
          onCancel={() => setPreviewData(null)}
        />
      )}

      {/* Custom Edit Dialog */}
      {isCustomEditOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Custom AI Edit</h3>
            <Textarea
              value={customEditPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomEditPrompt(e.target.value)}
              placeholder="Describe how you'd like to edit the selected text..."
              className="mb-4"
              rows={3}
              data-testid="input-custom-prompt"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setIsCustomEditOpen(false)}
                data-testid="button-cancel-custom"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCustomEditSubmit}
                disabled={!customEditPrompt.trim() || isLoading}
                data-testid="button-submit-custom"
              >
                Apply Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
