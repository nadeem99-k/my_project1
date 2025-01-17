'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Layer } from '@/types/editor';

interface CanvasProps {
  imageUrl: string;
}

export function Canvas({ imageUrl }: CanvasProps) {
  const { state, dispatch } = useEditor();
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas with base image
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    image.onload = () => {
      if (!mainCanvasRef.current) return;
      const canvas = mainCanvasRef.current;
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Add base image as first layer
      dispatch({
        type: 'ADD_LAYER',
        payload: {
          id: 'base-image',
          type: 'image',
          data: imageUrl,
          opacity: 1,
          blendMode: 'normal',
          visible: true,
          locked: true,
        },
      });
    };
  }, [imageUrl, dispatch]);

  // Apply all layers and effects
  const renderLayers = () => {
    if (!mainCanvasRef.current) return;
    const ctx = mainCanvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    state.layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;

      switch (layer.type) {
        case 'image':
          renderImageLayer(ctx, layer);
          break;
        case 'drawing':
          renderDrawingLayer(ctx, layer);
          break;
        case 'shape':
          renderShapeLayer(ctx, layer);
          break;
        case 'text':
          renderTextLayer(ctx, layer);
          break;
      }
    });
  };

  // Layer-specific rendering functions
  const renderImageLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    const image = new Image();
    image.src = layer.data;
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      applyAdjustments(ctx);
    };
  };

  const renderDrawingLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    const { paths, color, size } = layer.data;
    paths.forEach((path: { points: { x: number; y: number }[] }) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      path.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });
  };

  const renderShapeLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    const { type, x, y, width, height, color, strokeWidth } = layer.data;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    switch (type) {
      case 'rectangle':
        ctx.strokeRect(x, y, width, height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;
    }
  };

  const renderTextLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    const { text, font, size, color, x, y, align, rotation } = layer.data;
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  // Apply image adjustments
  const applyAdjustments = (ctx: CanvasRenderingContext2D) => {
    const { brightness, contrast, saturation, temperature, blur, hue } = state.adjustments;
    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
      hue-rotate(${hue}deg)
    `;
  };

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.tool !== 'brush' && state.tool !== 'eraser') return;
    
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    setLastPoint(point);

    // Create new layer for drawing if needed
    if (!state.layers[state.currentLayer]?.type === 'drawing') {
      dispatch({
        type: 'ADD_LAYER',
        payload: {
          id: `drawing-${Date.now()}`,
          type: 'drawing',
          data: {
            paths: [],
            color: state.tool === 'eraser' ? '#ffffff' : state.brush.color,
            size: state.brush.size,
          },
          opacity: state.brush.opacity,
          blendMode: 'normal',
          visible: true,
          locked: false,
        },
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    
    const point = getCanvasPoint(e);
    const layer = state.layers[state.currentLayer];
    
    if (layer?.type === 'drawing') {
      const updatedLayer = {
        ...layer,
        data: {
          ...layer.data,
          paths: [
            ...layer.data.paths,
            {
              points: [lastPoint, point],
            },
          ],
        },
      };

      dispatch({
        type: 'UPDATE_LAYER',
        payload: {
          index: state.currentLayer,
          layer: updatedLayer,
        },
      });

      setLastPoint(point);
      renderLayers();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  // Helper function to get canvas coordinates
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  return (
    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
      <canvas
        ref={mainCanvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <canvas
        ref={tempCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
} 