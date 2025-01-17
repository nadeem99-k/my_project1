import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, style, resolution } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const enhancedPrompt = `${prompt} in ${style} style, professional quality, highly detailed, 8k`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Use a different endpoint that doesn't add watermarks
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&width=${resolution.split('x')[0]}&height=${resolution.split('x')[1]}`;

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 