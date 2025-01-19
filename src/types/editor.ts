export type Tool = 
  | 'move' 
  | 'brush' 
  | 'eraser' 
  | 'rectangle' 
  | 'circle' 
  | 'text' 
  | 'line' 
  | 'arrow' 
  | 'clone' 
  | 'blur'
  | 'crop';

export type Layer = {
  id: string;
  type: 'drawing' | 'shape' | 'text' | 'image' | 'adjustment';
  data: any;
  opacity: number;
  blendMode: BlendMode;
  visible: boolean;
  locked: boolean;
  content?: string;
  position?: { x: number; y: number };
  font?: string;
  size?: number;
  color?: string;
};

export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten';

export interface EditorState {
  tool: Tool;
  layers: Layer[];
  currentLayer: number;
  history: {
    past: Layer[][];
    present: Layer[] | null;
    future: Layer[][];
  };
  brush: {
    size: number;
    color: string;
    opacity: number;
  };
  text: {
    font: string;
    size: number;
    color: string;
    align: 'left' | 'center' | 'right';
    bold: boolean;
    italic: boolean;
  };
  transform: {
    scale: number;
    rotate: number;
    flipX: boolean;
    flipY: boolean;
  };
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
    blur: number;
    hue: number;
  };
  filters: {
    sepia: number;
    grayscale: number;
    invert: number;
  };
  textSettings: {
    font: string;
    size: number;
    color: string;
  };
}

export type EditorAction =
  | { type: 'SET_TOOL'; payload: Tool }
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'UPDATE_LAYER'; payload: { index: number; layer: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: number }
  | { type: 'SET_CURRENT_LAYER'; payload: number }
  | { type: 'UPDATE_BRUSH'; payload: Partial<EditorState['brush']> }
  | { type: 'UPDATE_TEXT'; payload: Partial<EditorState['text']> }
  | { type: 'UPDATE_TRANSFORM'; payload: Partial<EditorState['transform']> }
  | { type: 'UPDATE_ADJUSTMENTS'; payload: Partial<EditorState['adjustments']> }
  | { type: 'UPDATE_FILTERS'; payload: Partial<EditorState['filters']> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_TEXT_SETTINGS'; payload: Partial<EditorState['textSettings']> }; 