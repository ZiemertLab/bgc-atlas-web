import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../route.config';

export const runtime = 'nodejs';
export { config };

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the Express server
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3000';

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds');
    const zoom = searchParams.get('zoom');
    const limit = searchParams.get('limit') || '1000';
    const offset = searchParams.get('offset') || '0';
    const all = searchParams.get('all');

    // Build the URL with query parameters
    let url = `${expressServerUrl}/api/map/sample-locations`;

    // If requesting all samples, only pass the all parameter
    if (all === 'true') {
      url += `?all=true`;
    } else {
      // Otherwise, use the standard parameters
      url += `?limit=${limit}&offset=${offset}`;
      if (bounds) url += `&bounds=${bounds}`;
      if (zoom) url += `&zoom=${zoom}`;
    }

    // Create a new request to forward to the Express server
    const requestToForward = new Request(url, {
      method: 'GET',
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
