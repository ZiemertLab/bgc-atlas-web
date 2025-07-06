import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../route.config';

export const runtime = 'nodejs';
export { config };

export async function GET(
  request: NextRequest,
  context: { params: { jobId: string } }
) {
  try {
    // Extract the job ID directly from the URL
    const url = request.url;
    const urlParts = url.split('/');
    const jobId = urlParts[urlParts.length - 1].split('?')[0];

    // Get the search type from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Search type is required' },
        { status: 400 }
      );
    }

    // Forward the request to the Express server
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3000';

    // Create the URL with the job ID and search type
    const apiUrl = `${expressServerUrl}/api/search/status/${jobId}?type=${type}`;

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
