'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from "@/lib/utils";
import { 
  Save, 
  RotateCcw, 
  Crop, 
  SunMedium, 
  Contrast, 
  Type,
  ArrowLeft,
  Palette,
  FlipHorizontal,
  RotateCw,
  Droplets,
  Wand2,
  Pencil,
  Eraser,
  Square,
  Circle,
  Type as TextIcon,
  Layers,
  Undo2,
  Redo2,
  ZoomIn,
  Languages,
  Download,
  Image as ImageIcon,
  Move,
  Stamp,
} from 'lucide-react';

interface EditImageParams {
  params: Promise<{
    imageUrl: string;
  }>;
}

type Tool = 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'move' | 'clone' | 'blur';
type Layer = {
  id: string;
  type: 'drawing' | 'shape' | 'text' | 'image';
  data: any;
  opacity: number;
  blendMode: string;
  visible: boolean;
};

export default function EditImage({ params }: EditImageParams) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  
  const imageUrl = React.useMemo(() => {
    if (!resolvedParams?.imageUrl) return '';
    
    try {
      return decodeURIComponent(resolvedParams.imageUrl)
        .replace(/\+/g, ' ')
        .replace(/%2F/g, '/')
        .replace(/%3A/g, ':')
        .replace(/%3F/g, '?')
        .replace(/%3D/g, '=')
        .replace(/%26/g, '&');
    } catch (error) {
      console.error('Error decoding URL:', error);
      return resolvedParams.imageUrl;
    }
  }, [resolvedParams?.imageUrl]);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [invert, setInvert] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>('move');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [currentLayer, setCurrentLayer] = useState<number>(0);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    image.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = image.width;
        canvas.height = image.height;
        applyFilters(image);
      }
    };
  }, [imageUrl, brightness, contrast, saturation, sepia, blur]);

  const applyFilters = (image: HTMLImageElement) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const canvas = canvasRef.current;
    ctx.save();

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center of canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Apply transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.translate(-centerX, -centerY);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) 
                  contrast(${contrast}%) 
                  saturate(${saturation}%) 
                  sepia(${sepia}%) 
                  blur(${blur}px)
                  hue-rotate(${hueRotate}deg)
                  grayscale(${grayscale}%)
                  invert(${invert}%)`;

    ctx.drawImage(image, 0, 0);
    ctx.restore();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'brush' && selectedTool !== 'eraser') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedTool === 'eraser' ? '#ffffff' : brushColor;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save the current canvas state to the undo stack
      const imageData = canvasRef.current?.toDataURL();
      if (imageData) {
        setUndoStack(prev => [...prev, layers]);
        setLayers(prev => [...prev, {
          id: Date.now().toString(),
          type: 'drawing',
          data: imageData,
          opacity: 1,
          blendMode: 'normal',
          visible: true,
        }]);
      }
    }
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, layers]);
    setLayers(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, layers]);
    setLayers(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) handleRedo();
            else handleUndo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [layers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-8">
      <div className="container mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-1">
            <Card className="premium-glass premium-border premium-shadow">
              <CardContent className="p-4 space-y-2">
                <Button
                  variant={selectedTool === 'move' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setSelectedTool('move')}
                  className="w-full"
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedTool === 'brush' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setSelectedTool('brush')}
                  className="w-full"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {/* Add more tool buttons */}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="premium-glass premium-border premium-shadow">
              <CardHeader>
                <CardTitle className="premium-text">Edit Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
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
                    value={[brightness]}
                    onValueChange={([value]) => setBrightness(value)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Contrast className="w-4 h-4 mr-2" />
                    Contrast
                  </label>
                  <Slider
                    value={[contrast]}
                    onValueChange={([value]) => setContrast(value)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <div className="w-4 h-4 mr-2">🎨</div>
                    Saturation
                  </label>
                  <Slider
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value)}
                    min={0}
                    max={200}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <div className="w-4 h-4 mr-2">🌅</div>
                    Sepia
                  </label>
                  <Slider
                    value={[sepia]}
                    onValueChange={([value]) => setSepia(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <div className="w-4 h-4 mr-2">🌫️</div>
                    Blur
                  </label>
                  <Slider
                    value={[blur]}
                    onValueChange={([value]) => setBlur(value)}
                    min={0}
                    max={10}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Palette className="w-4 h-4 mr-2" />
                    Hue Rotate
                  </label>
                  <Slider
                    value={[hueRotate]}
                    onValueChange={([value]) => setHueRotate(value)}
                    min={0}
                    max={360}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Droplets className="w-4 h-4 mr-2" />
                    Grayscale
                  </label>
                  <Slider
                    value={[grayscale]}
                    onValueChange={([value]) => setGrayscale(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Invert
                  </label>
                  <Slider
                    value={[invert]}
                    onValueChange={([value]) => setInvert(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </label>
                  <Slider
                    value={[rotate]}
                    onValueChange={([value]) => setRotate(value)}
                    min={0}
                    max={360}
                    step={1}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1",
                      flipX && "bg-primary/10"
                    )}
                    onClick={() => setFlipX(!flipX)}
                  >
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Flip X
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1",
                      flipY && "bg-primary/10"
                    )}
                    onClick={() => setFlipY(!flipY)}
                  >
                    <FlipHorizontal className="w-4 h-4 mr-2 rotate-90" />
                    Flip Y
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    className="w-full premium-button premium-glass"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Image
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                      setSepia(0);
                      setBlur(0);
                      setHueRotate(0);
                      setGrayscale(0);
                      setInvert(0);
                      setRotate(0);
                      setFlipX(false);
                      setFlipY(false);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-glass premium-border premium-shadow">
              <CardHeader>
                <CardTitle className="premium-text">Layers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={cn(
                      "p-2 rounded-md flex items-center gap-2",
                      currentLayer === index && "bg-primary/10"
                    )}
                    onClick={() => setCurrentLayer(index)}
                  >
                    <div className="flex-1">{layer.type}</div>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={([value]) => {
                        const newLayers = [...layers];
                        newLayers[index].opacity = value / 100;
                        setLayers(newLayers);
                      }}
                      max={100}
                      step={1}
                      className="w-24"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 