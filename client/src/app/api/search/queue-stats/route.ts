import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../route.config';

export const runtime = 'nodejs';
export { config };

export async function GET(request: NextRequest) {
  try {
    // Get the search type from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    console.log('[DEBUG] Queue stats API route called with type:', type || 'all');

    // Forward the request to the Express server
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3000';
    console.log('[DEBUG] Express server URL:', expressServerUrl);

    // Create the URL with the search type if provided
    const apiUrl = type 
      ? `${expressServerUrl}/api/search/queue-stats?type=${type}`
      : `${expressServerUrl}/api/search/queue-stats`;
    console.log('[DEBUG] API URL for queue stats:', apiUrl);

    // Forward the request and get the response
    console.log('[DEBUG] Fetching queue stats from Express server');
    const response = await fetch(apiUrl);
    console.log('[DEBUG] Express server response status:', response.status);

    if (!response.ok) {
      console.error('[DEBUG] Express server error response:', response.statusText);
      throw new Error(`Express server responded with status: ${response.status}`);
    }

    // Get the raw response text for debugging
    const responseText = await response.text();
    console.log('[DEBUG] Raw response from Express server:', responseText);

    // Parse the response text
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[DEBUG] Parsed response data:', data);
      console.log('[DEBUG] Response data structure:', Object.keys(data));

      if (data.queueStats) {
        console.log('[DEBUG] Queue stats from Express server:', data.queueStats);
        console.log('[DEBUG] Queue stats activeJobs:', data.queueStats.activeJobs);
        console.log('[DEBUG] Queue stats waitingJobs:', data.queueStats.waitingJobs);
      } else {
        console.log('[DEBUG] No queueStats found in Express server response');
      }
    } catch (parseError) {
      console.error('[DEBUG] Error parsing Express server response:', parseError);
      throw new Error('Invalid JSON response from Express server');
    }

    // Return the parsed data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to Express server:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
