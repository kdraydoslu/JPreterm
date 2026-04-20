import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import refreshMarketData from '@/lib/market-data-refresh';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    // Attempt to get data from Redis
    const data = await redis.get('market_data');
    
    // If we have data, parse and return it
    if (data) {
      // Validate it's not too old, though market-data-refresh handles that mostly
      return NextResponse.json(data);
    }
    
    // If no data, trigger a refresh and try to return immediately
    console.log("No data found in Redis, triggering initial refresh...");
    
    // Fire and wait for the refresh
    await refreshMarketData();
    
    // Fetch it again post-refresh
    const freshData = await redis.get('market_data');
    
    if (freshData) {
      return NextResponse.json(freshData);
    }
    
    return NextResponse.json({ error: 'Failed to populate market data' }, { status: 500 });
  } catch (error: any) {
    console.error('Market data API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
