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
  textSettings: {
    font: 'Arial',
    size: 24,
    color: '#000000'
  }
};

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}>({ state: initialState, dispatch: () => null });

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.payload };
    
    case 'ADD_LAYER':
      return {
        ...state,
        layers: [...state.layers, action.payload],
        currentLayer: state.layers.length
      };
    
    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map((layer, i) => 
          i === action.payload.index 
            ? { ...layer, ...action.payload.layer }
            : layer
        )
      };

    case 'SET_CURRENT_LAYER':
      return { ...state, currentLayer: action.payload };

    case 'UPDATE_TEXT_SETTINGS':
      return {
        ...state,
        textSettings: { ...state.textSettings, ...action.payload }
      };
      
    default:
      return state;
  }
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => useContext(EditorContext); 