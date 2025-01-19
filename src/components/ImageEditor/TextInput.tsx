'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor } from "@/contexts/EditorContext";

interface TextInputProps {
  position: { x: number; y: number };
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function TextInput({ position, onSubmit, onCancel }: TextInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { state } = useEditor();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(text);
          }
          if (e.key === 'Escape') {
            onCancel();
          }
        }}
        style={{
          font: `${state.textSettings.size}px ${state.textSettings.font}`,
          color: state.textSettings.color,
        }}
        className="bg-transparent border rounded p-2 min-w-[100px] resize-none focus:outline-none focus:ring-2 ring-primary"
        placeholder="Type your text..."
        rows={1}
      />
    </div>
  );
} 