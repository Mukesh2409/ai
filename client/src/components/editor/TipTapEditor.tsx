import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useEffect } from 'react';
import type { Document } from '@shared/schema';

interface TipTapEditorProps {
  document: Document;
  onSelectionUpdate?: (selection: { from: number; to: number; text: string }) => void;
}

export function TipTapEditor({ document, onSelectionUpdate }: TipTapEditorProps) {
  const queryClient = useQueryClient();

  const updateDocumentMutation = useMutation({
    mutationFn: async (content: any) => {
      const response = await apiRequest("PUT", `/api/documents/${document.id}`, {
        content,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/documents", document.id],
      });
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: document.content || {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Welcome to AI Collaborative Editor" }]
        }
      ]
    },
    onUpdate: ({ editor }) => {
      // Debounced save
      const content = editor.getJSON();
      updateDocumentMutation.mutate(content);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onSelectionUpdate) return;
      
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      
      if (text.trim().length > 0) {
        onSelectionUpdate({ from, to, text: text.trim() });
      }
    },
    editorProps: {
      attributes: {
        class: 'editor-content prose prose-invert max-w-none focus:outline-none',
        'data-testid': 'editor-content',
      },
    },
  });

  useEffect(() => {
    if (editor && document.content) {
      editor.commands.setContent(document.content);
    }
  }, [editor, document.content]);

  const replaceSelection = (from: number, to: number, newText: string) => {
    if (editor) {
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent(newText)
        .run();
    }
  };

  const insertContent = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
  };

  return (
    <div className="h-full">
      <EditorContent 
        editor={editor} 
        className="h-full min-h-[600px] bg-card rounded-lg border border-border p-6 focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all"
      />
    </div>
  );
}
