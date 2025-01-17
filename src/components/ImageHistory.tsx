'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

export default function ImageHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('imageHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Generation History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {history.map((item) => (
            <div key={item.id} className="relative aspect-square">
              <Image
                src={item.imageUrl}
                alt={item.prompt}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 