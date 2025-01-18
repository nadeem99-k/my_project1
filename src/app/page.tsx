'use client';

import { useState } from 'react';
import ImageGenerationForm from '@/components/ImageGenerationForm';
import ImagePreview from '@/components/ImagePreview';
import ImageHistory from '@/components/ImageHistory';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageGeneration = async (formData: {
    prompt: string;
    style: string;
    resolution: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        
        // Save to history
        const historyItem = {
          id: Date.now().toString(),
          imageUrl: data.imageUrl,
          prompt: formData.prompt,
          style: formData.style,
          createdAt: new Date().toISOString(),
        };
        
        const savedHistory = localStorage.getItem('imageHistory');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        const updatedHistory = [historyItem, ...history].slice(0, 50); // Keep last 50 items
        localStorage.setItem('imageHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Art Studio
          </h1>
          <ThemeToggle />
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Stunning AI Art
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Transform your ideas into breathtaking visual masterpieces with our advanced AI art generator.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-3xl" />
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ImageGenerationForm onSubmit={handleImageGeneration} />
            <ImageHistory />
          </div>
          <div className="sticky top-24">
            <ImagePreview imageUrl={generatedImage} isLoading={isLoading} />
          </div>
        </div>
      </main>

      <footer className="border-t mt-20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 AI Art Studio. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
