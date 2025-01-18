'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "@/contexts/EditorContext";
import { cn } from "@/lib/utils";

export function LayersPanel() {
  const { state, dispatch } = useEditor();

  return (
    <Card className="premium-glass premium-border premium-shadow">
      <CardHeader>
        <CardTitle className="premium-text">Layers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.layers.map((layer, index) => (
          <div
            key={layer.id}
            className={cn(
              "p-2 rounded-md flex items-center gap-2",
              state.currentLayer === index && "bg-primary/10"
            )}
            onClick={() => dispatch({ type: 'SET_CURRENT_LAYER', payload: index })}
          >
            <div className="flex-1">{layer.type}</div>
            <Slider
              value={[layer.opacity * 100]}
              onValueChange={([value]) => {
                dispatch({
                  type: 'UPDATE_LAYER',
                  payload: { index, layer: { opacity: value / 100 } }
                });
              }}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 