'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { EditorState, EditorAction } from '@/types/editor';

const initialState: EditorState = {
  tool: 'move',
  layers: [],
  currentLayer: 0,
  history: {
    past: [],
    present: null,
    future: [],
  },
  brush: {
    size: 5,
    color: '#000000',
    opacity: 1,
  },
  text: {
    font: 'Arial',
    size: 16,
    color: '#000000',
    align: 'left',
    bold: false,
    italic: false,
  },
  transform: {
    scale: 1,
    rotate: 0,
    flipX: false,
    flipY: false,
  },
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    blur: 0,
    hue: 0,
  },
  filters: {
    sepia: 0,
    grayscale: 0,
    invert: 0,
  },
};

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}>({ state: initialState, dispatch: () => null });

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => useContext(EditorContext); 