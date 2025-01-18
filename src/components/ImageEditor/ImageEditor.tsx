'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { LayersPanel } from './LayersPanel';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { Canvas } from './Canvas';
import { useImageEditor } from '@/hooks/useImageEditor';
import { EditorProvider } from '@/contexts/EditorContext';

interface ImageEditorProps {
  imageUrl: string;
}

export function ImageEditor({ imageUrl }: ImageEditorProps) {
  return (
    <EditorProvider>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-1">
          <Toolbar />
        </div>
        
        <div className="lg:col-span-8">
          <Canvas imageUrl={imageUrl} />
        </div>
        
        <div className="lg:col-span-3 space-y-6">
          <AdjustmentsPanel />
          <LayersPanel />
        </div>
      </div>
    </EditorProvider>
  );
} 