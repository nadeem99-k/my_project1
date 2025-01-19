import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, XCircle, ImageIcon, Pencil } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ImagePreviewProps {
  imageUrl: string | null;
  isLoading: boolean;
  statusMessage: string | null;
}

export default function ImagePreview({ imageUrl, isLoading, statusMessage }: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-masterpiece-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Card className="gradient-border glass-effect animate-scale">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full animate-glow" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-float">
            Your Creation
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="aspect-square w-full relative bg-muted rounded-lg overflow-hidden shadow-xl ring-1 ring-primary/10 group">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/50 backdrop-blur-sm">
              <div className="relative animate-float">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 animate-pulse" />
                <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">{statusMessage}</p>
            </div>
          ) : imageUrl && !imageError ? (
            <>
              <Image
                src={imageUrl}
                alt="Generated image"
                fill
                className="object-cover transition-all duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
                unoptimized
                priority
              />
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link 
                  href={`/edit/${encodeURIComponent(imageUrl)}`}
                  passHref
                >
                  <Button
                    size="sm"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 transform hover:scale-105"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  onClick={handleDownload}
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">{statusMessage || 'Ready to generate'}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 