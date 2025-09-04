import { useState, useEffect, useRef } from "react";

export interface SelectionInfo {
  text: string;
  range: Range | null;
  rect: DOMRect | null;
  isActive: boolean;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionInfo>({
    text: "",
    range: null,
    rect: null,
    isActive: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleSelectionChange = () => {
      clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim() || "";
        
        if (text.length > 0 && sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setSelection({
            text,
            range,
            rect,
            isActive: true,
          });
        } else {
          setSelection(prev => ({ ...prev, isActive: false }));
        }
      }, 100);
    };

    const handleClick = (e: MouseEvent) => {
      // Check if click is outside selection area
      const target = e.target as Element;
      if (!target.closest('.floating-toolbar') && !target.closest('.editor-content')) {
        setSelection(prev => ({ ...prev, isActive: false }));
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timeoutRef.current);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const clearSelection = () => {
    setSelection({
      text: "",
      range: null,
      rect: null,
      isActive: false,
    });
    window.getSelection()?.removeAllRanges();
  };

  return { selection, clearSelection };
}
