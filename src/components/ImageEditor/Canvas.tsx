'use client';

import { useRef, useEffect, useState } from 'react';
import { useEditor } from "@/contexts/EditorContext";
import { TextInput } from './TextInput';

interface CanvasProps {
  imageUrl: string;
}

export function Canvas({ imageUrl }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = useEditor();
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Draw layers
      state.layers.forEach(layer => {
        if (layer.type === 'text' && layer.content && layer.position) {
          ctx.font = `${layer.size}px ${layer.font}`;
          ctx.fillStyle = layer.color || '#000000';
          ctx.globalAlpha = layer.opacity;
          ctx.fillText(layer.content, layer.position.x, layer.position.y);
        }
        // Add other layer type rendering here
      });
    };
  }, [imageUrl, state.layers]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.tool !== 'text') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTextPosition({ x, y });
    setIsAddingText(true);
  };

  const handleTextSubmit = (text: string) => {
    dispatch({
      type: 'ADD_LAYER',
      payload: {
        id: Date.now().toString(),
        type: 'text',
        data: {},
        content: text,
        position: textPosition,
        font: state.textSettings.font,
        size: state.textSettings.size,
        color: state.textSettings.color,
        opacity: 1,
        blendMode: 'normal',
        visible: true,
        locked: false
      }
    });
    setIsAddingText(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        onClick={handleCanvasClick}
      />
      {isAddingText && (
        <TextInput
          position={textPosition}
          onSubmit={handleTextSubmit}
          onCancel={() => setIsAddingText(false)}
        />
      )}
    </div>
  );
} 