'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const styles = [
  { value: 'real-world', label: 'Real World Photo' },
  { value: 'realistic', label: 'Photorealistic' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: '3d-render', label: '3D Render' },
  { value: 'pixel-art', label: 'Pixel Art' },
];

const resolutions = [
  { value: '256x256', label: '256x256' },
  { value: '512x512', label: '512x512' },
  { value: '1024x1024', label: '1024x1024' },
];

interface ImageGenerationFormProps {
  onSubmit: (data: { prompt: string; style: string; resolution: string }) => void;
}

export default function ImageGenerationForm({ onSubmit }: ImageGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('real-world');
  const [resolution, setResolution] = useState('512x512');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ prompt, style, resolution });
  };

  return (
    <Card className="premium-glass premium-border premium-shadow animate-scale">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gradient-to-b from-purple-600 via-pink-500 to-orange-400 rounded-full animate-pulse" />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold premium-text">
              Create Your Masterpiece
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/90">
              Transform imagination into stunning visuals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
              <span className="premium-text">Prompt</span>
              <span className="px-2 py-0.5 text-xs premium-glass rounded-full">
                Required
              </span>
            </label>
            <div className="relative group">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene lake at sunset with mountains in the background..."
                required
                className="flex h-24 w-full rounded-lg premium-glass px-4 py-3 text-sm resize-none 
                  transition-all duration-300 placeholder:text-muted-foreground/50
                  focus:outline-none focus:ring-2 focus:ring-purple-500/20
                  group-hover:bg-white/[0.02]"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-400/10 
                blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="style" className="text-sm font-medium flex items-center gap-2">
                <span className="premium-text">Art Style</span>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse" />
              </label>
              <Select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="premium-glass w-full transition-all duration-300 
                  hover:bg-white/[0.02] focus:ring-2 focus:ring-purple-500/20"
              >
                {styles.map((style) => (
                  <option key={style.value} value={style.value} className="bg-background">
                    {style.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="resolution" className="text-sm font-medium flex items-center gap-2">
                <span className="premium-text">Resolution</span>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse" />
              </label>
              <Select
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="premium-glass w-full transition-all duration-300 
                  hover:bg-white/[0.02] focus:ring-2 focus:ring-purple-500/20"
              >
                {resolutions.map((res) => (
                  <option key={res.value} value={res.value} className="bg-background">
                    {res.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full premium-button premium-glass group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-80
              group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-3 text-white font-medium">
              <span className="text-lg">✨</span>
              Generate Masterpiece
              <span className="text-lg">✨</span>
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 