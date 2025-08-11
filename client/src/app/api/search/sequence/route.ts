import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../route.config';

export const runtime = 'nodejs';
export { config };

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the Express server
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3000';

    // Get the content type from the request headers
    const contentType = request.headers.get('Content-Type') || '';

    // Create a new request to forward to the Express server
    const requestToForward = new Request(`${expressServerUrl}/api/search/sequence`, {
      method: 'POST',
      body: await request.blob(),
      headers: {
        'Content-Type': contentType,
      },
    });

    // Forward the request and get the response
    const response = await fetch(requestToForward);

    if (!response.ok) {
      throw new Error(`Express server responded with status: ${response.status}`);
    }

    // Return the response from the Express server
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to Express server:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
