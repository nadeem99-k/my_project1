'use client';

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useEditor } from "@/contexts/EditorContext";

export function TextControls() {
  const { state, dispatch } = useEditor();
  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Select
        value={state.textSettings.font}
        onValueChange={(value) => 
          dispatch({ 
            type: 'UPDATE_TEXT_SETTINGS', 
            payload: { font: value } 
          })
        }
      >
        {fonts.map(font => (
          <option key={font} value={font}>{font}</option>
        ))}
      </Select>
      
      <Input
        type="number"
        value={state.textSettings.size}
        onChange={(e) => 
          dispatch({
            type: 'UPDATE_TEXT_SETTINGS',
            payload: { size: Number(e.target.value) }
          })
        }
        min={8}
        max={200}
      />
      
      <Input
        type="color"
        value={state.textSettings.color}
        onChange={(e) =>
          dispatch({
            type: 'UPDATE_TEXT_SETTINGS',
            payload: { color: e.target.value }
          })
        }
      />
    </div>
  );
} 