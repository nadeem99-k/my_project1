import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Utility function for logging errors
function logError(service: string, error: any) {
  console.error(`[${new Date().toISOString()}] ${service} Error:`, {
    message: error.message,
    code: error.code,
    status: error.status,
    details: error
  });
}

async function generateWithPollinations(prompt: string, style: string): Promise<string> {
  try {
    const encodedPrompt = encodeURIComponent(`${prompt} in ${style} style, professional quality, highly detailed`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
    
    // Verify the image is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`Failed to generate image with Pollinations: ${response.status}`);
    }

    return imageUrl;
  } catch (error: any) {
    logError('Pollinations', error);
    throw error;
  }
}

async function enhanceWithHotpot(imageUrl: string): Promise<string> {
  if (!process.env.HOTPOT_API_KEY) {
    throw new Error('Hotpot API key not configured');
  }

  try {
    // Fetch the Pollinations image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Enhance with Hotpot - Updated endpoint
    const response = await fetch('https://api.hotpot.ai/v1/enhance-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HOTPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image,
        enhanceDetails: true,
        reduceNoise: true,
        improveClarity: true,
        upscale: true,
        upscaleBy: 1.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hotpot enhancement failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.url;
  } catch (error: any) {
    logError('Hotpot Enhancement', error);
    throw error;
  }
}

type GenerationStatus = {
  status: 'generating' | 'enhancing' | 'completed' | 'failed';
  message: string;
  imageUrl?: string;
  provider?: string;
  error?: string;
};

async function* generateImageWithStatus(prompt: string, style: string): AsyncGenerator<GenerationStatus> {
  try {
    // Step 1: Generate with Pollinations
    yield { 
      status: 'generating', 
      message: 'Creating initial artwork with Pollinations AI...' 
    };

    const baseImageUrl = await generateWithPollinations(prompt, style);
    
    // Step 2: Enhance with Hotpot
    yield { 
      status: 'enhancing',
      message: 'Enhancing image details with Hotpot AI...',
      imageUrl: baseImageUrl,
      provider: 'pollinations'
    };

    try {
      const enhancedImageUrl = await enhanceWithHotpot(baseImageUrl);
      yield {
        status: 'completed',
        message: 'Image generation and enhancement completed',
        imageUrl: enhancedImageUrl,
        provider: 'pollinations+hotpot'
      };
    } catch (hotpotError) {
      // If enhancement fails, return the original image
      yield {
        status: 'completed',
        message: 'Image generated (enhancement unavailable)',
        imageUrl: baseImageUrl,
        provider: 'pollinations'
      };
    }
  } catch (error: unknown) {
    logError('Image Generation', error instanceof Error ? error : new Error(String(error)));
    yield {
      status: 'failed',
      message: 'Image generation failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, style } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const status of generateImageWithStatus(prompt, style)) {
            controller.enqueue(encoder.encode(JSON.stringify(status) + '\n'));
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                status: 'failed',
                message: 'Generation failed',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
              }) + '\n'
            )
          );
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: unknown) {
    logError('API Route', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate image',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 