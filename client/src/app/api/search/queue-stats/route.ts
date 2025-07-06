import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../route.config';

export const runtime = 'nodejs';
export { config };

export async function GET(request: NextRequest) {
  try {
    // Get the search type from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    // Forward the request to the Express server
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3000';

    // Create the URL with the search type if provided
    const apiUrl = type 
      ? `${expressServerUrl}/api/search/queue-stats?type=${type}`
      : `${expressServerUrl}/api/search/queue-stats`;

    // Forward the request and get the response
    const response = await fetch(apiUrl);

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
