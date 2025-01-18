'use client';

import { Button } from "@/components/ui/button";
import { Move, Pencil, Eraser, Square, Circle, Type, Stamp } from 'lucide-react';
import { useEditor } from "@/contexts/EditorContext";

export function Toolbar() {
  const { state, dispatch } = useEditor();

  const tools = [
    { id: 'move', icon: Move },
    { id: 'brush', icon: Pencil },
    { id: 'eraser', icon: Eraser },
    { id: 'rectangle', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'text', icon: Type },
    { id: 'clone', icon: Stamp },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={state.tool === tool.id ? "default" : "ghost"}
          size="icon"
          onClick={() => dispatch({ type: 'SET_TOOL', payload: tool.id })}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
} 