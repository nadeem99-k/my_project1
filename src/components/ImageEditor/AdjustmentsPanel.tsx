'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "@/contexts/EditorContext";
import { SunMedium, Contrast, Droplets, Palette } from 'lucide-react';

export function AdjustmentsPanel() {
  const { state, dispatch } = useEditor();

  return (
    <Card className="premium-glass premium-border premium-shadow">
      <CardHeader>
        <CardTitle className="premium-text">Adjustments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium">
            <SunMedium className="w-4 h-4 mr-2" />
            Brightness
          </label>
          <Slider
            value={[state.adjustments.brightness]}
            onValueChange={([value]) => 
              dispatch({ 
                type: 'UPDATE_ADJUSTMENTS', 
                payload: { brightness: value } 
              })
            }
            min={0}
            max={200}
            step={1}
          />
        </div>
        {/* Add more adjustment controls */}
      </CardContent>
    </Card>
  );
} 