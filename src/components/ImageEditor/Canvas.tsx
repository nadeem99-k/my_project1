'use client';

import { useRef, useEffect } from 'react';
import { useEditor } from "@/contexts/EditorContext";

interface CanvasProps {
  imageUrl: string;
}

export function Canvas({ imageUrl }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useEditor();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  );
} 